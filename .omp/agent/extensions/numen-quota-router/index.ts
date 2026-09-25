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
} from "@oh-my-pi/pi-coding-agent";
import { logger } from "@oh-my-pi/pi-utils";
import { config, routingEnabled } from "./config";
import { routeSubagentModel, routingStore, SubagentRoutingError } from "./router";
import type { RoutingDispatchRow } from "./store";

async function onBeforeSubagentSpawn(
	event: BeforeSubagentSpawnEvent,
	ctx: ExtensionContext,
): Promise<BeforeSubagentSpawnEventResult | undefined> {
	const sessionId = ctx.sessionManager.getSessionId();
	const spawnId = `${sessionId}:${event.spawnKey ?? "anonymous"}:${randomUUID()}`;
	try {
		const outcome = await routeSubagentModel({
			ctx,
			sessionId,
			id: spawnId,
			agent: event.agent,
			role: event.modelRole,
			patterns: event.patterns,
		});
		if (!outcome.reason) return undefined;
		return {
			model: outcome.patterns,
			note: outcome.reason,
		};
	} catch (error) {
		if (error instanceof SubagentRoutingError) {
			return { block: true, reason: error.message };
		}
		logger.warn("numen-quota-router: routing failed open", {
			id: spawnId,
			error: error instanceof Error ? error.message : "unknown error",
		});
		return undefined;
	}
}

function ago(ms: number): string {
	const minutes = Math.round(ms / 60_000);
	return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}

function describe(row: RoutingDispatchRow, now: number): string {
	const role = row.role ? `@${row.role}` : "explicit";
	return `${ago(now - row.startedAt)} ago  ${row.id}  ${row.agent} (${role})  ${row.selector}  ${row.outcome ?? "historical"}${row.pinned ? "  pinned" : ""}  ${row.confidence}\n    ${row.reason}`;
}

async function showRouting(_args: string, ctx: ExtensionCommandContext): Promise<void> {
	const now = Date.now();
	const store = await routingStore();
	const recent = store.recentDecisions(12);
	const lines = [
		`numen quota router: ${routingEnabled() ? "enabled" : "disabled"}  reserve ${config.reservePct}%  policy ${config.reservePolicy}`,
		`pools: ${
			Object.entries(config.pools)
				.map(([role, pool]) => `@${role} -> ${pool.join(" | ")}`)
				.join("; ") || "none"
		}`,
		"recent dispatch decisions:",
		...(recent.length > 0 ? recent.map(row => `  ${describe(row, now)}`) : ["  none"]),
	];
	ctx.ui.notify(lines.join("\n"), "info");
}

export default function numenQuotaRouter(pi: ExtensionAPI): void {
	pi.on("before_subagent_spawn", onBeforeSubagentSpawn);
	pi.registerCommand("routing", {
		description: "Show the numen quota router's pools and recent dispatch decisions",
		handler: showRouting,
	});
}
