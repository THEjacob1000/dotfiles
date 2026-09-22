// generated-by: numen-sync
/**
 * numen quota router: picks each subagent's model by which subscription has
 * headroom right now, so the Claude and Codex allowances are both spent
 * through the day instead of one running dry while the other idles.
 *
 * Hooks OMP's `subagent_route` gate once per fresh child and `subagent_settled`
 * to release the in-flight reservation. `/routing` shows the ledger.
 */
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import type {
	SubagentRouteEvent,
	SubagentRouteEventResult,
	SubagentSettledEvent,
} from "@oh-my-pi/pi-coding-agent/extensibility/shared-events";
import { logger } from "@oh-my-pi/pi-utils";
import { config, routingEnabled } from "./config";
import { routeSubagentModel, routingStore, SubagentRoutingError, type SubagentRoutingOutcome } from "./router";
import type { RoutingCompletion, RoutingDispatchRow } from "./store";

const releases = new Map<string, SubagentRoutingOutcome["release"]>();
const settledEarly = new Set<string>();
const MAX_SETTLED_EARLY = 256;

async function onRoute(event: SubagentRouteEvent, ctx: ExtensionContext): Promise<SubagentRouteEventResult | undefined> {
	let outcome: SubagentRoutingOutcome;
	try {
		outcome = await routeSubagentModel({
			ctx,
			sessionId: event.sessionId,
			parentAgentId: event.parentAgentId,
			id: event.id,
			agent: event.agent,
			role: event.role,
			patterns: event.patterns,
			sourcePatterns: event.sourcePatterns,
			effort: event.effort,
		});
	} catch (error) {
		if (error instanceof SubagentRoutingError) return { block: true, reason: error.message };
		// A router fault must never take the spawn down with it: fall through to the static selection.
		logger.warn("numen-quota-router: routing failed open", {
			id: event.id,
			error: error instanceof Error ? error.message : "unknown error",
		});
		return undefined;
	}
	if (!outcome.summary) return undefined;
	if (settledEarly.delete(event.id)) {
		outcome.release({ outcome: "aborted", endedAt: Date.now() });
	} else {
		releases.set(event.id, outcome.release);
	}
	return { patterns: outcome.patterns, routing: outcome.summary };
}

function onSettled(event: SubagentSettledEvent): void {
	if (!routingEnabled()) return;
	const completion: RoutingCompletion = {
		outcome: event.outcome,
		endedAt: Date.now(),
		finalSelector: event.resolvedModel,
		usage: event.usage,
	};
	const release = releases.get(event.id);
	releases.delete(event.id);
	if (release) {
		release(completion);
		return;
	}
	settledEarly.add(event.id);
	if (settledEarly.size > MAX_SETTLED_EARLY) {
		const oldest = settledEarly.values().next().value;
		if (oldest !== undefined) settledEarly.delete(oldest);
	}
}

function ago(ms: number): string {
	const minutes = Math.round(ms / 60_000);
	return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

function describe(row: RoutingDispatchRow, now: number): string {
	const state = row.endedAt === null ? "open" : (row.outcome ?? "ended");
	const changed = row.modelChanged && row.finalSelector ? ` -> ${row.finalSelector}` : "";
	const role = row.role ? `@${row.role}` : "explicit";
	return `${ago(now - row.startedAt)} ago  ${row.id}  ${row.agent} (${role})  ${row.selector}${changed}  ${state}${row.pinned ? "  pinned" : ""}  ${row.confidence}\n    ${row.reason}`;
}

async function showRouting(_args: string, ctx: ExtensionCommandContext): Promise<void> {
	const now = Date.now();
	const store = await routingStore();
	const open = store.openDispatches();
	const recent = store.recentDecisions(12);
	const lines = [
		`numen quota router: ${routingEnabled() ? "enabled" : "disabled"}  reserve ${config.reservePct}%  policy ${config.reservePolicy}`,
		`pools: ${
			Object.entries(config.pools)
				.map(([role, pool]) => `@${role} -> ${pool.join(" | ")}`)
				.join("; ") || "none"
		}`,
		"",
		`in flight (${open.length}):`,
		...(open.length > 0 ? open.map(row => `  ${describe(row, now)}`) : ["  none"]),
		"",
		"recent decisions:",
		...(recent.length > 0 ? recent.map(row => `  ${describe(row, now)}`) : ["  none"]),
	];
	ctx.ui.notify(lines.join("\n"), "info");
}

export default function numenQuotaRouter(pi: ExtensionAPI): void {
	pi.on("subagent_route", onRoute);
	pi.on("subagent_settled", onSettled);
	pi.registerCommand("routing", {
		description: "Show the numen quota router's pools, in-flight dispatches and recent decisions",
		handler: showRouting,
	});
}
