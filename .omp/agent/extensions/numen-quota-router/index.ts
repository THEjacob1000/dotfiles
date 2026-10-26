// generated-by: numen-sync
/**
 * Quota-aware routing at OMP's supported pre-subagent-spawn seam.
 *
 * `/routing` shows dispatch-time decisions; OMP exposes no child completion
 * lifecycle to extensions, so this module records no in-flight state.
 */
import { randomUUID } from "node:crypto";
import type {
	BeforeSubagentSpawnEvent,
	BeforeSubagentSpawnEventResult,
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
	ToolCallEvent,
	ToolCallEventResult,
	ToolExecutionEndEvent,
	ToolExecutionStartEvent,
} from "@oh-my-pi/pi-coding-agent";
import { settings } from "@oh-my-pi/pi-coding-agent";
import {
	resolveConfiguredModelPatterns,
	resolveExplicitModelRole,
} from "@oh-my-pi/pi-coding-agent/config/model-resolver";
import { generateTaskName } from "@oh-my-pi/pi-coding-agent/task/name-generator";
import { logger } from "@oh-my-pi/pi-utils";
import { config, routingEnabled, tiersEnabled } from "./config";
import {
	routeSubagentModel,
	routingStore,
	SubagentRoutingError,
} from "./router";
import type { RoutingDispatchRow } from "./store";
import { classifyAssignment, type TierDecision } from "./tier";

interface PendingDecision {
	name: string;
	agent: string;
	decision: TierDecision;
	requestedEffort?: string;
	toolCallId: string;
	expiresAt: number;
}

const staged = new Map<string, PendingDecision[]>();
let pending: PendingDecision[] = [];
const PENDING_TTL = 10 * 60_000;

function prunePending(): void {
	const now = Date.now();
	pending = pending.filter((entry) => entry.expiresAt > now);
	for (const [id, entries] of staged) {
		const live = entries.filter((entry) => entry.expiresAt > now);
		if (live.length) staged.set(id, live);
		else staged.delete(id);
	}
}

function consumeDecision(
	spawnKey: string,
	agent: string,
): PendingDecision | undefined {
	prunePending();
	const matching = (name: string) =>
		spawnKey === name || spawnKey.endsWith(`.${name}`);
	let index = pending.findIndex(
		(entry) => entry.agent === agent && matching(entry.name),
	);
	if (index < 0) {
		const base = spawnKey.replace(/-\d+$/, "");
		index = pending.findIndex(
			(entry) =>
				entry.agent === agent &&
				(base === entry.name || base.endsWith(`.${entry.name}`)),
		);
	}
	return index < 0 ? undefined : pending.splice(index, 1)[0];
}

function onTaskStart(event: ToolExecutionStartEvent): void {
	if (event.toolName !== "task") return;
	prunePending();
	const entries = staged.get(event.toolCallId);
	if (!entries) return;
	pending.push(...entries);
	staged.delete(event.toolCallId);
}

/** Only host-supplied resolved fields count as runtime observations. Async pending rows expose none. */
export function observedTaskDispatches(
	details: unknown,
): Array<{ id: string; model: string; effort?: string }> {
	if (!details || typeof details !== "object") return [];
	const data = details as Record<string, unknown>;
	const rows = [data.results, data.progress].flatMap((value) =>
		Array.isArray(value) ? value : [],
	);
	const seen = new Set<string>();
	return rows.flatMap((row: unknown) => {
		if (!row || typeof row !== "object") return [];
		const fields = row as Record<string, unknown>;
		const model = fields.resolvedModel;
		if (
			typeof fields.id !== "string" ||
			!/^[A-Za-z0-9_.-]{1,128}$/.test(fields.id) ||
			typeof model !== "string" ||
			!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:@[A-Za-z0-9_.-]+)?(?::(?:minimal|low|medium|high|xhigh|max))?$/.test(
				model,
			)
		)
			return [];
		const key = `${fields.id}:${model}`;
		if (seen.has(key)) return [];
		seen.add(key);
		const effort = fields.resolvedThinkingLevel;
		return [
			{
				id: fields.id,
				model,
				effort:
					typeof effort === "string" &&
					/^(minimal|low|medium|high|xhigh|max)$/.test(effort)
						? effort
						: undefined,
			},
		];
	});
}

function onTaskEnd(event: ToolExecutionEndEvent): void {
	if (event.toolName !== "task") return;
	const result = event.result;
	const details =
		result && typeof result === "object" && "details" in result
			? result.details
			: undefined;
	for (const dispatch of observedTaskDispatches(details))
		logger.info("numen-quota-router: runtime dispatch observed", {
			...dispatch,
			source: "task result resolved fields",
		});
	const asyncJob =
		details && typeof details === "object" && "async" in details
			? details.async
			: undefined;
	if (
		!event.isError &&
		asyncJob &&
		typeof asyncJob === "object" &&
		"jobId" in asyncJob &&
		typeof asyncJob.jobId === "string" &&
		"type" in asyncJob &&
		asyncJob.type === "task"
	)
		return;
	staged.delete(event.toolCallId);
	pending = pending.filter((entry) => entry.toolCallId !== event.toolCallId);
}

function defaultDecision(reason: string): TierDecision {
	return { rawWinner: "configured", probabilities: {}, confidence: 0, reason };
}

function modelInput(value: unknown): string | string[] | undefined {
	if (typeof value === "string" && value.trim()) return value;
	if (
		Array.isArray(value) &&
		value.length &&
		value.every((item) => typeof item === "string")
	)
		return value;
	return undefined;
}

async function onTaskToolCall(
	event: ToolCallEvent,
): Promise<ToolCallEventResult | undefined> {
	if (event.toolName !== "task") return undefined;
	try {
		const input = event.input;
		const batch = Array.isArray(input.tasks);
		const items: unknown[] = batch ? (input.tasks as unknown[]) : [input];
		const context =
			typeof input.context === "string" ? input.context : undefined;
		let changed = false;
		const decisions: Array<PendingDecision | undefined> = [];
		const rewritten = await Promise.all(
			items.map(async (item, index) => {
				if (typeof item !== "object" || item === null || Array.isArray(item))
					return item;
				const fields = item as Record<string, unknown>;
				if (typeof fields.task !== "string") return item;
				const agent = typeof fields.agent === "string" ? fields.agent : "task";
				if (
					!config.tiers.agents.includes(agent) &&
					typeof fields.name !== "string"
				)
					return item;
				const requestedModel = modelInput(fields.model ?? input.model);
				const explicit =
					requestedModel !== undefined &&
					resolveExplicitModelRole(requestedModel, settings) === undefined;
				const decision = explicit
					? defaultDecision("explicit model preserved; classification skipped")
					: !config.tiers.agents.includes(agent)
						? defaultDecision("agent role preserved; classification skipped")
						: !tiersEnabled()
							? defaultDecision(
									"tier routing disabled; configured model retained",
								)
							: await classifyAssignment({
									agent,
									assignment: fields.task,
									context,
									metadata: { ...input, ...fields },
								});
				const name =
					typeof fields.name === "string" && fields.name.trim()
						? fields.name.trim()
						: generateTaskName();
				const effort = fields.effort ?? input.effort;
				decisions[index] = {
					name,
					agent,
					decision,
					toolCallId: event.toolCallId,
					expiresAt: Date.now() + PENDING_TTL,
					requestedEffort:
						typeof effort === "string" && /^[a-z0-9-]{1,16}$/.test(effort)
							? effort
							: undefined,
				};
				if (fields.name === name) return item;
				changed = true;
				return { ...fields, name };
			}),
		);
		prunePending();
		const ready = decisions.filter(
			(entry): entry is PendingDecision => entry !== undefined,
		);
		if (ready.length) staged.set(event.toolCallId, ready);
		if (!changed) return undefined;
		return {
			input: batch
				? { ...input, tasks: rewritten }
				: (rewritten[0] as Record<string, unknown>),
		};
	} catch {
		logger.warn("numen-quota-router: task rewrite failed open", {
			error: "routing-error",
		});
		return undefined;
	}
}

function tierSelection(event: BeforeSubagentSpawnEvent): {
	role?: string;
	patterns: string[];
	note?: string;
	rerouted?: boolean;
} {
	const { modelRole, patterns, spawnKey } = event;
	const entry =
		event.invocationKind === "task" && spawnKey
			? consumeDecision(spawnKey, event.agent)
			: undefined;
	if (!entry)
		return {
			role: modelRole,
			patterns,
			note: routingEnabled()
				? "jev: no task classification available; configured model retained"
				: undefined,
		};
	const decision = entry.decision;
	const effort = entry.requestedEffort
		? `; caller effort requested ${entry.requestedEffort} (runtime setting and model limits apply)`
		: "";
	if (!config.tiers.agents.includes(event.agent) || modelRole === undefined)
		return {
			role: modelRole,
			patterns,
			note: `jev: ${modelRole === undefined ? "explicit model preserved" : decision.reason}${effort}`,
		};
	const probabilities = config.tiers.options
		.filter(
			(option) =>
				option.active && decision.probabilities[option.id] !== undefined,
		)
		.map(
			(option) =>
				`${option.id} ${decision.probabilities[option.id]?.toFixed(2).replace(/^0/, "")}`,
		)
		.join(" ");
	const label = decision.option?.id ?? "configured";
	const score = decision.option
		? ` p=${decision.probabilities[decision.option.id]?.toFixed(2)}`
		: "";
	const note = `jev: ${label}${score} conf=${decision.confidence.toFixed(2)} [${probabilities}]; ${decision.reason}; raw choice ${decision.rawWinner}${effort}`;
	if (!decision.option) return { role: modelRole, patterns, note };
	const selected = resolveConfiguredModelPatterns(
		decision.option.selector,
		settings,
	);
	if (!selected.length)
		return {
			role: modelRole,
			patterns,
			note: `${note}; selected tier unresolved; configured model retained`,
		};
	if (selected[0] === patterns[0]) return { role: modelRole, patterns, note };
	return { role: undefined, patterns: selected, note, rerouted: true };
}

async function retryConfiguredRole(
	event: BeforeSubagentSpawnEvent,
	ctx: ExtensionContext,
	sessionId: string | undefined,
	spawnId: string,
	tierNote: string,
): Promise<BeforeSubagentSpawnEventResult | undefined> {
	try {
		const fallback = await routeSubagentModel({
			ctx,
			sessionId,
			id: spawnId,
			agent: event.agent,
			role: event.modelRole,
			patterns: event.patterns,
			note: tierNote,
		});
		return fallback.reason
			? { model: fallback.patterns, note: fallback.reason }
			: undefined;
	} catch (error) {
		if (error instanceof SubagentRoutingError)
			return { block: true, reason: error.message };
		logger.warn("numen-quota-router: fallback routing failed open", {
			error: "routing-error",
		});
		return undefined;
	}
}

async function onBeforeSubagentSpawn(
	event: BeforeSubagentSpawnEvent,
	ctx: ExtensionContext,
): Promise<BeforeSubagentSpawnEventResult | undefined> {
	const sessionId = ctx.sessionManager.getSessionId();
	const spawnId = `${sessionId}:${event.spawnKey ?? "anonymous"}:${randomUUID()}`;
	const { role, patterns, note: tierNote, rerouted } = tierSelection(event);
	try {
		const outcome = await routeSubagentModel({
			ctx,
			sessionId,
			id: spawnId,
			agent: event.agent,
			role,
			patterns,
			note: tierNote,
		});
		if (!outcome.reason && !tierNote) return undefined;
		return {
			model: outcome.patterns,
			note: [tierNote, outcome.reason].filter(Boolean).join("; "),
		};
	} catch (error) {
		if (error instanceof SubagentRoutingError) {
			return rerouted
				? retryConfiguredRole(
						event,
						ctx,
						sessionId,
						spawnId,
						`${tierNote}; selected tier blocked (${error.outcome}); retrying configured role`,
					)
				: { block: true, reason: error.message };
		}
		logger.warn("numen-quota-router: routing failed open", {
			id: spawnId,
			error: "routing-error",
		});
		return tierNote ? { model: patterns, note: tierNote } : undefined;
	}
}

function ago(ms: number): string {
	const minutes = Math.round(ms / 60_000);
	return minutes < 60
		? `${minutes}m`
		: `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

function describe(row: RoutingDispatchRow, now: number): string {
	const role = row.role ? `@${row.role}` : "explicit";
	return `${ago(now - row.startedAt)} ago  ${row.id}  ${row.agent} (${role})  ${row.selector}  ${row.outcome ?? "historical"}${row.pinned ? "  pinned" : ""}  ${row.confidence}\n    ${row.reason}`;
}

async function showRouting(
	_args: string,
	ctx: ExtensionCommandContext,
): Promise<void> {
	const now = Date.now();
	const store = await routingStore();
	const recent = store.recentDecisions(12);
	const lines = [
		`numen quota router: ${routingEnabled() ? "enabled" : "disabled"}  reserve ${config.reservePct}%  policy ${config.reservePolicy}`,
		`jev tier routing: ${!tiersEnabled() ? "disabled" : !process.env.TYPESAFE_API_KEY ? "no key" : "enabled"}  model ${config.tiers.model}  active ${config.tiers.options
			.filter((option) => option.active)
			.map((option) => option.id)
			.join(", ")}  disabled ${config.tiers.options
			.filter((option) => !option.active)
			.map((option) => option.id)
			.join(", ")}`,
		`pools: ${
			Object.entries(config.pools)
				.map(([role, pool]) => `@${role} -> ${pool.join(" | ")}`)
				.join("; ") || "none"
		}`,
		"recent hook dispatch decisions (runtime model/effort and completion not observed):",
		...(recent.length > 0
			? recent.map((row) => `  ${describe(row, now)}`)
			: ["  none"]),
	];
	ctx.ui.notify(lines.join("\n"), "info");
}

export default function numenQuotaRouter(pi: ExtensionAPI): void {
	pi.on("tool_call", onTaskToolCall);
	pi.on("tool_execution_start", onTaskStart);
	pi.on("tool_execution_end", onTaskEnd);
	pi.on("before_subagent_spawn", onBeforeSubagentSpawn);
	pi.registerCommand("routing", {
		description:
			"Show the numen quota router's pools and recent dispatch decisions",
		handler: showRouting,
	});
}
