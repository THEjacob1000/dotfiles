// generated-by: numen-sync
/**
 * Operator configuration for the quota router: edit it, run `numen sync`,
 * restart OMP. `numen.jevRouter: false` in the OMP config turns Jev tier routing
 * off per machine. `NUMEN_QUOTA_ROUTER=off` and `NUMEN_JEV_ROUTER=off` in the
 * environment disable either for one process without a sync.
 */
import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { getAgentDir } from "@oh-my-pi/pi-utils";
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
			"Pick the option that gives the best result per dollar for this delegated coding task. Each option lists the work it covers and its cost tier. Choose the lowest-cost option whose description covers the task; choose a higher-cost one only when the task needs work listed under it. Judge the work required, not the length of the brief.",
		options: [
			{
				id: "luna-low",
				selector: "openai-codex/gpt-6-luna:low",
				active: true,
				criteria: {
					what: "Fully specified mechanical work: renames, edits whose exact change the brief spells out, file or symbol inventory, search-and-report, formatting, running named commands and summarising their output. Lowest cost.",
					not_for: "Anything that needs a decision the brief does not already make, writing new logic, or debugging.",
				},
			},
			{
				id: "luna-high",
				selector: "openai-codex/gpt-6-luna:high",
				active: false,
				criteria: {
					what: "Small, well-scoped implementation, tests or a localised bugfix where the brief names the files and the expected behaviour. Low cost per token; high effort can spend many tokens.",
					not_for: "Vague briefs, multi-file changes, delicate behaviour changes, or anything where a subtle mistake would go unnoticed.",
				},
			},
			{
				id: "sol-medium",
				selector: "openai-codex/gpt-6.1-sol:medium",
				active: true,
				criteria: {
					what: "Engineering where the brief settles what to build: multi-file features and tests, bugs with a known or locatable cause, long changes inside one repo, refactors, subsystem investigation, terminal- and tool-heavy automation, graphics and 3D programming, data analysis, reading dense documents, front-end changes whose behaviour and look the brief already specifies, and exploit-style security work. Moderate cost.",
					not_for: "Visual and interaction design decisions; unknown-cause debugging, architecture or trust-boundary decisions.",
				},
			},
			{
				id: "sonnet-medium",
				selector: "anthropic/claude-sonnet-5-5:medium",
				active: false,
				criteria: {
					what: "Fast, bounded edits and quick iteration, especially terminal-driven work, where response speed matters more than depth. Moderate cost.",
					not_for: "Deep judgment or careful reasoning, visual design decisions, cross-module refactors or architecture.",
				},
			},
			{
				id: "opus-medium",
				selector: "anthropic/claude-opus-5-5:medium",
				active: true,
				criteria: {
					what: "Visual and interaction design work (components, styling, layout, interaction, polish), code review, codebase-wide migrations and audits, and checking whether a brief's assumptions hold before building on them. Higher cost.",
					not_for: "Unknown-cause debugging, architecture or trust-boundary decisions that need high effort; exploit-style security work, which Anthropic's cyber safeguards can hand to an older model.",
				},
			},
			{
				id: "opus-high",
				selector: "anthropic/claude-opus-5-5:high",
				active: true,
				criteria: {
					what: "Unknown-cause debugging, architecture decisions, trust-boundary and concurrency code, new screens, design systems and UX flows, underspecified problems where the brief itself may be wrong, and long autonomous runs where a wrong answer is expensive. Highest effort and highest cost.",
					not_for: "Well-specified work, UI polish, review or refactors; exploit-style security work, which Anthropic's cyber safeguards can hand to an older model.",
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

/** `numen.jevRouter` from the OMP config, which `numen sync` writes to `numen.json`. */
function jevRouterSetting(): boolean {
	const file = path.join(getAgentDir(), "numen.json");
	if (!existsSync(file)) return true;
	const settings: unknown = JSON.parse(readFileSync(file, "utf8"));
	return !(typeof settings === "object" && settings !== null && "jevRouter" in settings && settings.jevRouter === false);
}

export function tiersEnabled(): boolean {
	return enabledWithOverride(process.env.NUMEN_JEV_ROUTER, config.tiers.enabled && jevRouterSetting());
}
