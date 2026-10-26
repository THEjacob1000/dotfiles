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
export interface TierOption {
	id: string;
	selector: string;
	active: boolean;
	/** Only offer when the caller supplies bounded source evidence for escalation. */
	requiresEscalationEvidence?: boolean;
	/** Provisional relative total-work cost preference, not cash pricing or a token guarantee. */
	costRank: number;
	criteria: { what: string; not_for: string };
}

export interface TierConfig {
	enabled: boolean;
	model: string;
	agents: string[];
	minConfidence: number;
	probabilityTieTolerance: number;
	timeoutMs: number;
	maxStateChars: number;
	instructions: string;
	options: TierOption[];
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
		probabilityTieTolerance: 0.02,
		timeoutMs: 1500,
		maxStateChars: 12000,
		instructions:
			"Choose the lowest-cost suitable option for the work and its acceptance checks. This is provisional evidence-informed task-fit policy, not a benchmark ranking. Judge required decisions, coupling, ambiguity, verification and consequences, not brief length or labels such as audit, architecture or unknown bug. Ordinary implementation, review and evidence-gathering debugging may use a general engineering option. Raise effort or choose a costlier option only for specific unmet needs; Astra requires explicit escalation evidence that a lower-cost option failed acceptance or cannot cover the task. Cost ranks are relative total-work preferences: subscription headroom, API-equivalent token estimates, latency and actual cash are different measures; unknown or zero catalog prices do not mean free. Do not invent capabilities, prices, prior failures or missing context.",
		options: [
			{
				id: "luna-low",
				selector: "openai-codex/gpt-6-luna:low",
				active: true,
				costRank: 1,
				criteria: {
					what: "Explicit mechanical work with little discretion: exact renames or amendments, inventory, search-and-report, formatting, or running named commands and summarising output. Acceptance and the intended change are supplied.",
					not_for:
						"New logic, debugging that needs hypotheses, choosing unspecified behaviour, or subtle verification whose failure would be consequential.",
				},
			},
			{
				id: "luna-high",
				selector: "openai-codex/gpt-6-luna:high",
				active: false,
				costRank: 2,
				criteria: {
					what: "Small, well-scoped implementation or tests with named files, specified behaviour and direct acceptance checks.",
					not_for:
						"Ambiguous behaviour, cross-boundary coupling or consequential mistakes without strong verification.",
				},
			},
			{
				id: "sol-medium",
				selector: "openai-codex/gpt-6.1-sol:medium",
				active: true,
				costRank: 2,
				criteria: {
					what: "General engineering: implementation and tests, specified multi-file changes, ordinary reviews and audits, refactors, frontend behaviour, investigation and debugging that requires gathering evidence and testing hypotheses. An initially unknown cause alone is not a reason to escalate. Use when acceptance checks can bound the work.",
					not_for:
						"Explicitly mechanical work suited to the cheaper option; substantial unresolved coupling, consequential design tradeoffs or repeated failed acceptance that needs higher effort.",
				},
			},
			{
				id: "sonnet-medium",
				selector: "anthropic/claude-sonnet-5-5:medium",
				active: true,
				costRank: 2,
				criteria: {
					what: "Competing general engineering option for bounded implementation, tests, ordinary review and localised investigation, especially turnaround-sensitive iteration with clear acceptance checks. Select on concrete task fit or observed turnaround needs, not provider labels.",
					not_for:
						"Mechanical work covered by the cheaper option, or unresolved cross-boundary design and expensive-to-detect mistakes requiring higher effort.",
				},
			},
			{
				id: "sol-high",
				selector: "openai-codex/gpt-6.1-sol:high",
				active: true,
				costRank: 3,
				criteria: {
					what: "Engineering needing deeper reasoning about coupled modules, competing hypotheses, ambiguous requirements, consequential API or interaction decisions, concurrency and trust boundaries, or evidence that medium effort failed acceptance. Identify the extra decisions and verification burden.",
					not_for:
						"Routine implementation or review with bounded acceptance; an architecture or audit label, an unknown bug, or a long brief without additional reasoning needs.",
				},
			},
			{
				id: "opus-medium",
				selector: "anthropic/claude-opus-5-5:medium",
				active: true,
				costRank: 4,
				criteria: {
					what: "Alternative for consequential design or review that must reconcile interacting constraints, assumptions and user behaviour across boundaries. Choose when the brief or prior evidence identifies a task-fit benefit over the cheaper engineering options; design and audits do not automatically require this option.",
					not_for:
						"Ordinary review, implementation, evidence-gathering debugging or UI polish already covered by cheaper options; complexity inferred only from a task label.",
				},
			},
			{
				id: "opus-high",
				selector: "anthropic/claude-opus-5-5:high",
				active: true,
				costRank: 5,
				criteria: {
					what: "Alternative high-effort option for material ambiguity, tightly coupled consequential design, difficult concurrency or trust-boundary reasoning, and failures that remain after cheaper attempts. Require specific reasoning or verification needs that justify the added expected work cost.",
					not_for:
						"Routine work or escalation merely because a task says audit, architecture, design, security or unknown-cause debugging.",
				},
			},
			{
				id: "astra-high",
				selector: "openai-codex/gpt-6-astra:high",
				active: true,
				requiresEscalationEvidence: true,
				costRank: 6,
				criteria: {
					what: "Exceptional escalation with explicit evidence: a cheaper capable option failed representative acceptance checks, or a concrete capability or reasoning requirement cannot be covered by the other options. State the unmet requirement and bound the escalation work.",
					not_for:
						"The default for hard, lengthy, high-stakes or ambiguous work; choosing the largest model without evidence of a lower-cost option's inadequacy.",
				},
			},
		],
	},
};

function enabledWithOverride(
	value: string | undefined,
	fallback: boolean,
): boolean {
	const override = value?.trim().toLowerCase();
	if (override === "off" || override === "0" || override === "false")
		return false;
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
	return !(
		typeof settings === "object" &&
		settings !== null &&
		"jevRouter" in settings &&
		settings.jevRouter === false
	);
}

export function tiersEnabled(): boolean {
	return enabledWithOverride(
		process.env.NUMEN_JEV_ROUTER,
		config.tiers.enabled && jevRouterSetting(),
	);
}
