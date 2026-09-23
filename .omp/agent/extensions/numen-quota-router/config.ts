// generated-by: numen-sync
/**
 * Operator configuration for the quota router. This file is the whole config
 * surface: edit it, run `numen sync`, restart OMP. `NUMEN_QUOTA_ROUTER=off` in
 * the environment disables routing for one process without a sync.
 */
import type { RoutingReservePolicy } from "./policy";

export interface RouterConfig {
	enabled: boolean;
	/**
	 * Per model role, the pool a spawn naming that role may draw from, in
	 * preference order. Entries are model selectors or role aliases; a
	 * `:level` suffix on the spawn's alias or expanded role value is inherited
	 * by pool entries that carry none. Roles absent here are pins: their
	 * configured model, then the role's `retry.fallbackChains` entry, nothing else.
	 */
	pools: Record<string, string[]>;
	/** Remaining fraction of an allowance at or below which a candidate stops taking new work. */
	reservePct: number;
	/**
	 * What to do when every candidate is inside its reserve: `auto` spends the
	 * best one anyway, `fail-closed` refuses the spawn, `confirm` refuses with a
	 * message naming the choices (a headless spawn cannot prompt).
	 */
	reservePolicy: RoutingReservePolicy;
	/** A usage report older than this counts as no evidence. */
	staleReportMs: number;
	/** Fraction of a provider's allowance one in-flight dispatch is assumed to consume until observed dispatches supply a better estimate. */
	inflightEstimatePct: number;
	/** Discount applied to a candidate's headroom per preference rank (0..1); 0 ignores operator order, 1 makes it decisive. */
	preferenceWeight: number;
	/** Relative headroom difference under which two candidates count as tied and the less recently used one wins. */
	tieTolerance: number;
}

export const config: RouterConfig = {
	enabled: true,
	pools: {
		// Judgment-heavy subagent work: Codex sol first, Fable when the Codex allowance is the tighter one.
		task: ["openai-codex/gpt-6-sol", "anthropic/claude-fable-5-1"],
		// Grunt work: luna first, haiku when luna is scarce.
		smol: ["openai-codex/gpt-6-luna", "anthropic/claude-haiku-4-5"],
		// Second-opinion review: either flagship reviewer.
		advisor: ["openai-codex/gpt-6-sol", "anthropic/claude-opus-5-5"],
	},
	reservePct: 10,
	reservePolicy: "auto",
	staleReportMs: 15 * 60 * 1000,
	inflightEstimatePct: 2,
	preferenceWeight: 0.15,
	tieTolerance: 0.1,
};

export function routingEnabled(): boolean {
	const override = process.env.NUMEN_QUOTA_ROUTER?.trim().toLowerCase();
	if (override === "off" || override === "0" || override === "false") return false;
	if (override === "on" || override === "1" || override === "true") return true;
	return config.enabled;
}
