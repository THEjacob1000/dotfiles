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
					"Well-scoped implementation, tests or a localised bugfix where the brief names the files and the expected behaviour. Scores about Opus 5 at medium on DeepSWE for a twentieth of Sol's price, but trails GPT-6.1 Sol by nine points there and is unreliable on vague briefs or delicate behaviour changes.",
			},
			{
				id: "sol-medium",
				selector: "openai-codex/gpt-6.1-sol:medium",
				active: true,
				criteria:
					"Most non-UI engineering work: multi-file features and tests, known-cause and moderately hard bugs, long-horizon changes inside one repo, subsystem investigation, graphics programming (rendering, shaders, 3D models and meshes, visualisation), terminal-, tool- and computer-use-heavy automation, data analysis and reading dense documents. Beats GPT-6 Astra on DeepSWE and Opus 5.5 on document and medium-effort workflow benchmarks at a third to a seventh of their cost per task, and uses the fewest tokens of any option above Luna. Poor at front-end, UI and interface design work, which goes to Sonnet or Opus however well specified; graphics and 3D model work are not UI and stay here. Trails Opus on open-ended judgment: it tends to satisfy a wrong spec rather than challenge it. Slow at about 67 tokens/s, and its 272k Codex context is small for work that must read a large codebase at once.",
			},
			{
				id: "sonnet-medium",
				selector: "anthropic/claude-sonnet-5-5:medium",
				active: true,
				criteria:
					"Front-end and UI work: components, styling, layout, interaction and visual polish, the default for any UI task Opus is not needed for. Also terminal-heavy agentic work, fast iteration, and well-scoped engineering that must hold more code or documentation than Sol's 272k window. Tops Opus 5.5 on Terminal-Bench 4.0, sits two points under it on CursorBench, runs about twice Sol's speed with 1M context, at Sol's token price but spending several times Sol's tokens per task. Weaker than Opus on open-ended judgment, and its cyber safeguards downgrade exploit-style security work.",
			},
			{
				id: "opus-medium",
				selector: "anthropic/claude-opus-5-5:medium",
				active: false,
				criteria:
					"Code review, cross-module refactors, codebase-wide migrations and audits, and agentic tasks where the cause or design is mostly known. Leads FrontierCode and CursorBench and catches wrong specs Sol would implement, at twice Sol's token price.",
			},
			{
				id: "opus-high",
				selector: "anthropic/claude-opus-5-5:high",
				active: true,
				criteria:
					"Unknown-cause debugging, architecture decisions, trust-boundary and concurrency code, UI work that needs design judgment (new screens, design systems, UX flows) rather than polish, underspecified problems where the brief itself may be wrong, and long autonomous runs where a wrong answer is expensive. Highest independent intelligence score and best prompt-injection resistance of any option, at twice Sol's token price; exploit-style security work falls back to an older Opus under its safeguards, so Sol suits that better.",
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
