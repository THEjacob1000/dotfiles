// generated-by: numen-sync
/**
 * Operator configuration for the quota router. This file is the whole config
 * surface: edit it, run `numen sync`, restart OMP. `NUMEN_QUOTA_ROUTER=off` in
 * the environment disables routing for one process without a sync.
 */
import type { RoutingReservePolicy } from "./policy";
export interface TierConfig {
	enabled: boolean;
	model: string;
	agents: string[];
	minConfidence: number;
	shadowFloor: number;
	timeoutMs: number;
	maxStateChars: number;
	instructions: string;
	options: Array<{ id: string; selector: string; active: boolean; criteria: string }>;
}

export interface RouterConfig {
	enabled: boolean;
	tiers: TierConfig;
	/**
	 * Optional quota-balanced pools for roles that intentionally permit peers
	 * to trade places. Ordered retry chains do not belong here: roles absent
	 * from this map keep their configured native model while usable, then walk
	 * `retry.fallbackChains` in order.
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
	/** Discount applied to a candidate's headroom per preference rank (0..1); 0 ignores operator order, 1 makes it decisive. */
	preferenceWeight: number;
	/** Relative headroom difference under which two candidates count as tied and the less recently used one wins. */
	tieTolerance: number;
}

export const config: RouterConfig = {
	enabled: true,
	pools: {},
	reservePct: 10,
	reservePolicy: "auto",
	preferenceWeight: 0.15,
	tieTolerance: 0.1,
	tiers: {
		enabled: true,
		model: "jev-1.13.0",
		agents: ["task"],
		minConfidence: 0.3,
		shadowFloor: 0.15,
		timeoutMs: 1500,
		maxStateChars: 12000,
		instructions:
			"Pick the option that gives the best result per dollar for this delegated coding task. Each option describes where that model beats its price. A cheaper option wins whenever its strengths cover the task; pick a pricier one only when the task needs what it is specifically better at. Judge the work required, not the length of the brief.",
		options: [
			{
				id: "luna-low",
				selector: "openai-codex/gpt-6-luna:low",
				active: true,
				criteria:
					"Fully specified mechanical work: renames, edits whose exact change the brief spells out, file/symbol inventory, search-and-report, formatting, running named commands and summarising output. About a twentieth of Sol's price; weak when anything is ambiguous.",
			},
			{
				id: "luna-high",
				selector: "openai-codex/gpt-6-luna:high",
				active: false,
				criteria:
					"Well-scoped implementation, tests or a localised bugfix where the brief names the files and the expected behaviour. Near Sol's coding benchmark scores at a fraction of the cost, but unreliable on vague briefs or delicate behaviour changes.",
			},
			{
				id: "sol-medium",
				selector: "openai-codex/gpt-6-sol:medium",
				active: true,
				criteria:
					"Routine engineering across a few files: specified features and tests, known-cause bugs, scoped investigation of one subsystem, tool-heavy automation. Good general value; its 272k context is small for work that must read a large codebase.",
			},
			{
				id: "sonnet-medium",
				selector: "anthropic/claude-sonnet-5-5:medium",
				active: false,
				criteria:
					"Well-scoped engineering and bugfixes that must read or hold a lot of code or documentation at once, terminal-heavy agentic work, and UI polish. Sol's price and coding scores with 1M context, and above Opus 5.5 on Terminal-Bench; weaker than Opus on open-ended judgment, and its cyber safeguards refuse or downgrade exploit-style security work.",
			},
			{
				id: "opus-medium",
				selector: "anthropic/claude-opus-5-5:medium",
				active: false,
				criteria:
					"Code review, cross-module refactors, long-codebase work and agentic tasks where the cause or design is mostly known. Top FrontierCode and CursorBench scores at twice Sol's price.",
			},
			{
				id: "opus-high",
				selector: "anthropic/claude-opus-5-5:high",
				active: true,
				criteria:
					"Unknown-cause debugging, architecture decisions, security or trust-boundary code, concurrency, and long autonomous runs where a wrong answer is expensive. Strongest available coder, and cheaper than GPT-6 Astra.",
			},
		],
	},
};

function enabledWithOverride(value: string | undefined, fallback: boolean): boolean {
	const override = value?.trim().toLowerCase();
	if (override === "off" || override === "0" || override === "false") return false;
	if (override === "on" || override === "1" || override === "true") return true;
	return fallback;
}

export function routingEnabled(): boolean {
	return enabledWithOverride(process.env.NUMEN_QUOTA_ROUTER, config.enabled);
}

export function tiersEnabled(): boolean {
	return enabledWithOverride(process.env.NUMEN_JEV_ROUTER, config.tiers.enabled);
}
