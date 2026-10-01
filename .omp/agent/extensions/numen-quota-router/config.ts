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
	options: Array<{ id: string; selector: string; active: boolean; criteria: { what: string; not_for: string } }>;
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
				criteria: {
					what: "Fully specified mechanical work: renames, edits whose exact change the brief spells out, file or symbol inventory, search-and-report, formatting, running named commands and summarising their output. By far the cheapest option.",
					not_for: "Anything that needs a decision the brief does not already make, writing new logic, or debugging.",
				},
			},
			{
				id: "luna-high",
				selector: "openai-codex/gpt-6-luna:high",
				active: false,
				criteria: {
					what: "Small, well-scoped implementation, tests or a localised bugfix where the brief names the files and the expected behaviour. Very cheap per token, but thinks long and verbosely, so the saving over Sol per task is smaller than its price suggests.",
					not_for: "Vague briefs, multi-file changes, delicate behaviour changes, or anything where a subtle mistake would go unnoticed.",
				},
			},
			{
				id: "sol-medium",
				selector: "openai-codex/gpt-6.1-sol:medium",
				active: true,
				criteria: {
					what: "The default for non-UI engineering: multi-file features and tests, known-cause and moderately hard bugs, long changes inside one repo, subsystem investigation, terminal- and tool-heavy automation, graphics and 3D programming, data analysis, reading dense documents, and exploit-style security work. Cheapest of the strong options and the most token-efficient.",
					not_for: "Front-end, UI and interface design work; briefs that may themselves be wrong, where it tends to implement a flawed spec faithfully instead of questioning it; work that must hold more code or documentation than fits its smaller context window.",
				},
			},
			{
				id: "sonnet-medium",
				selector: "anthropic/claude-sonnet-5-5:medium",
				active: false,
				criteria: {
					what: "Fast, bounded edits and quick iteration, especially terminal-driven work, where response speed matters more than depth.",
					not_for: "Anything needing judgment or careful reasoning: at this effort it is clearly weaker than Opus at medium and no cheaper than Sol, so real UI, refactor and design work goes to Opus.",
				},
			},
			{
				id: "opus-medium",
				selector: "anthropic/claude-opus-5-5:medium",
				active: true,
				criteria: {
					what: "Front-end and UI work (components, styling, layout, interaction, visual polish), code review, cross-module refactors, codebase-wide migrations and audits, and engineering that must hold more code or documentation than Sol's window. Best result per task of any option on real-repo coding; catches wrong specs Sol would implement. About twice Sol's cost per task.",
					not_for: "Routine non-UI work Sol covers; unknown-cause debugging, architecture or trust-boundary work that needs Opus at high effort; exploit-style security work, which its safeguards downgrade.",
				},
			},
			{
				id: "opus-high",
				selector: "anthropic/claude-opus-5-5:high",
				active: true,
				criteria: {
					what: "Unknown-cause debugging, architecture decisions, trust-boundary and concurrency code, new screens, design systems and UX flows that need design judgment, underspecified problems where the brief itself may be wrong, and long autonomous runs where a wrong answer is expensive. Strongest judgment and prompt-injection resistance of any option; the most expensive.",
					not_for: "Well-specified work, UI polish, review or refactors that Opus at medium handles; exploit-style security work, which its safeguards downgrade.",
				},
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
