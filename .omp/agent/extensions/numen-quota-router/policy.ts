// generated-by: numen-sync
/**
 * Pure quota-aware subagent routing from provider account state and configured
 * preference order. The host exposes only state, remaining allowance, and
 * reset time; the policy makes no claims about in-flight cost or report age.
 */

export const ROUTING_POLICY_VERSION = 1;

export type RoutingHealthState = "healthy" | "reserve" | "depleted" | "unknown";

export type RoutingReservePolicy = "confirm" | "auto" | "fail-closed";

/** Provider-reported allowance state for one candidate. */
export interface RoutingHealthSnapshot {
	state: RoutingHealthState;
	remainingFraction?: number;
	resetsAt?: number;
}

export interface RoutingCandidate {
	/** Concrete `provider/model[:level]` selector the executor will resolve. */
	selector: string;
	provider: string;
	modelId: string;
	/** Position in the configured pool: 0 is the operator's preferred choice. */
	preference: number;
	/** Whether a usable credential exists for the provider right now. */
	authenticated: boolean;
	/** Why this candidate could not be authenticated, when resolution failed before credential lookup. */
	unavailableReason?: string;
	health: RoutingHealthSnapshot;
	/** Dispatches recently sent to this provider; drives the fair tie-break. */
	recentDispatches: number;
}

export interface RoutingPolicyInput {
	now: number;
	agent: string;
	role?: string;
	/**
	 * True when the first candidate is an explicit single-model pin. The
	 * remaining candidates are then only the fallbacks policy explicitly
	 * permits, and a healthy pin is never traded for a better-scoring sibling.
	 */
	pinned: boolean;
	/** Remaining fraction at or below which a candidate stops taking new work. */
	reserveFraction: number;
	reservePolicy: RoutingReservePolicy;
	/** Discount applied to a candidate's headroom per preference rank (0..1). */
	preferenceWeight: number;
	/** Relative headroom difference under which candidates are comparable (0..1). */
	tieTolerance: number;
	candidates: RoutingCandidate[];
}

export type RoutingConfidence = "high" | "low";

/** Per-candidate evaluation retained for the audit record and the explanation. */
export interface RoutingCandidateAssessment {
	selector: string;
	provider: string;
	modelId: string;
	preference: number;
	authenticated: boolean;
	effectiveState: RoutingHealthState;
	reportedState: RoutingHealthState;
	effectiveRemaining?: number;
	/** Headroom above the reserve; higher spends more sustainably. */
	slack?: number;
	resetsAt?: number;
	/** Why this candidate ranks where it does. */
	note: string;
}

export interface RoutingSelected {
	kind: "selected";
	selector: string;
	provider: string;
	modelId: string;
	/** Selected selector first, then every other eligible candidate as the runtime fallback chain. */
	patterns: string[];
	reason: string;
	confidence: RoutingConfidence;
	assessments: RoutingCandidateAssessment[];
}

export type RoutingBlockedOutcome = "reserve-confirm" | "fail-closed" | "exhausted" | "unauthenticated";

export interface RoutingBlocked {
	kind: "blocked";
	outcome: RoutingBlockedOutcome;
	reason: string;
	/** Earliest moment any candidate's binding window resets, when a provider reported one. */
	earliestResetAt?: number;
	assessments: RoutingCandidateAssessment[];
}

export type RoutingDecision = RoutingSelected | RoutingBlocked;

function formatPercent(fraction: number): string {
	return `${Math.round(fraction * 100)}%`;
}

function formatResetAt(resetsAt: number | undefined, now: number): string {
	if (resetsAt === undefined) return "reset time unknown";
	const deltaMs = resetsAt - now;
	if (deltaMs <= 0) return "reset due";
	const totalMinutes = Math.round(deltaMs / 60_000);
	if (totalMinutes < 60) return `resets in ${totalMinutes}m`;
	const hours = Math.floor(totalMinutes / 60);
	if (hours < 48) return `resets in ${hours}h${String(totalMinutes % 60).padStart(2, "0")}m`;
	return `resets in ${Math.round(hours / 24)}d`;
}

function describeAllowance(assessment: RoutingCandidateAssessment, input: RoutingPolicyInput): string {
	if (assessment.effectiveRemaining === undefined) {
		return `${assessment.reportedState} (${formatResetAt(assessment.resetsAt, input.now)})`;
	}
	return `${formatPercent(assessment.effectiveRemaining)} left (${formatResetAt(assessment.resetsAt, input.now)})`;
}

function assess(candidate: RoutingCandidate, input: RoutingPolicyInput): RoutingCandidateAssessment {
	const { health } = candidate;
	const base: RoutingCandidateAssessment = {
		selector: candidate.selector,
		provider: candidate.provider,
		modelId: candidate.modelId,
		preference: candidate.preference,
		authenticated: candidate.authenticated,
		effectiveState: "unknown",
		reportedState: health.state,
		resetsAt: health.resetsAt,
		note: "",
	};
	if (!candidate.authenticated) {
		return {
			...base,
			effectiveState: "depleted",
			note: candidate.unavailableReason ?? "no usable credential",
		};
	}
	if (health.state === "depleted") {
		return {
			...base,
			effectiveState: "depleted",
			note: `exhausted (${formatResetAt(health.resetsAt, input.now)})`,
		};
	}
	if (health.state === "unknown") {
		return { ...base, note: "no reliable usage report" };
	}
	const remaining = health.remainingFraction;
	if (remaining === undefined) {
		return {
			...base,
			effectiveState: health.state,
			note: `${health.state} (${formatResetAt(health.resetsAt, input.now)})`,
		};
	}
	const effectiveRemaining = Math.max(0, remaining);
	const inReserve = effectiveRemaining <= input.reserveFraction;
	return {
		...base,
		effectiveState: inReserve ? "reserve" : "healthy",
		effectiveRemaining,
		slack: effectiveRemaining - input.reserveFraction,
		note: inReserve
			? `inside ${formatPercent(input.reserveFraction)} reserve (${formatPercent(effectiveRemaining)} left, ${formatResetAt(health.resetsAt, input.now)})`
			: `${formatPercent(effectiveRemaining)} left (${formatResetAt(health.resetsAt, input.now)})`,
	};
}

function rankHealthy(
	healthy: RoutingCandidateAssessment[],
	input: RoutingPolicyInput,
	bySelector: Map<string, RoutingCandidate>,
): RoutingCandidateAssessment[] {
	const weight = Math.min(1, Math.max(0, input.preferenceWeight));
	const tolerance = Math.min(1, Math.max(0, input.tieTolerance));
	const score = (assessment: RoutingCandidateAssessment): number =>
		(assessment.slack ?? 0) * Math.max(0, 1 - weight * assessment.preference);
	return [...healthy].sort((a, b) => {
		const slackA = a.slack ?? 0;
		const slackB = b.slack ?? 0;
		const comparable = Math.abs(slackA - slackB) <= tolerance * Math.max(Math.abs(slackA), Math.abs(slackB));
		if (comparable) {
			const fairness =
				(bySelector.get(a.selector)?.recentDispatches ?? 0) - (bySelector.get(b.selector)?.recentDispatches ?? 0);
			if (fairness !== 0) return fairness;
			return a.preference - b.preference;
		}
		const scored = score(b) - score(a);
		if (scored !== 0) return scored;
		return a.preference - b.preference;
	});
}

function eligiblePatterns(
	selected: RoutingCandidateAssessment,
	ordered: RoutingCandidateAssessment[],
	strictFallbackOrder: boolean,
	includeReserve: boolean,
): string[] {
	const patterns = [selected.selector];
	for (const assessment of ordered) {
		if (
			assessment.selector === selected.selector ||
			assessment.effectiveState === "depleted" ||
			(!includeReserve && assessment.effectiveState === "reserve") ||
			(strictFallbackOrder && assessment.preference < selected.preference)
		) {
			continue;
		}
		if (!patterns.includes(assessment.selector)) patterns.push(assessment.selector);
	}
	return patterns;
}

function firstUsableCandidate(
	ordered: RoutingCandidateAssessment[],
): { assessment: RoutingCandidateAssessment; confidence: RoutingConfidence } | undefined {
	const assessment = ordered.find(
		candidate => candidate.effectiveState === "healthy" || candidate.effectiveState === "unknown",
	);
	if (!assessment) return undefined;
	return {
		assessment,
		confidence: assessment.effectiveState === "healthy" ? "high" : "low",
	};
}

function firstReserveFallback(
	ordered: RoutingCandidateAssessment[],
	pin: RoutingCandidateAssessment,
): RoutingCandidateAssessment | undefined {
	return ordered.find(assessment => assessment.selector !== pin.selector && assessment.effectiveState === "reserve");
}

interface PinnedChoice {
	assessment: RoutingCandidateAssessment;
	confidence: RoutingConfidence;
	why: string;
}

function choosePinned(
	ordered: RoutingCandidateAssessment[],
	reservePolicy: RoutingReservePolicy,
): PinnedChoice | undefined {
	const [pin] = ordered;
	if (!pin) return undefined;
	const permitted = firstUsableCandidate(ordered);
	if (permitted) {
		let why: string;
		if (permitted.assessment.selector !== pin.selector) {
			why = `pinned ${pin.selector} ${pin.note}; first usable configured fallback ${permitted.assessment.selector} is ${permitted.assessment.effectiveState}`;
		} else if (permitted.assessment.effectiveState === "healthy") {
			why = "explicit pin, allowance healthy";
		} else {
			why = `explicit pin kept, ${pin.note}`;
		}
		return { ...permitted, why };
	}
	if (reservePolicy !== "auto") return undefined;
	const reserve = firstReserveFallback(ordered, pin);
	if (!reserve) return undefined;
	return {
		assessment: reserve,
		confidence: "high",
		why: `pinned ${pin.selector} ${pin.note}; reservePolicy auto spends first configured fallback in reserve`,
	};
}

function earliestReset(assessments: RoutingCandidateAssessment[], now: number): number | undefined {
	const resets = assessments
		.map(assessment => assessment.resetsAt)
		.filter((resetsAt): resetsAt is number => resetsAt !== undefined && resetsAt > now);
	return resets.length > 0 ? Math.min(...resets) : undefined;
}

function explain(
	selected: RoutingCandidateAssessment,
	assessments: RoutingCandidateAssessment[],
	input: RoutingPolicyInput,
	why: string,
): string {
	const others = assessments
		.filter(assessment => assessment.selector !== selected.selector)
		.map(assessment => `${assessment.selector}: ${assessment.note}`);
	const scope = input.role ? `role ${input.role}` : `agent ${input.agent}`;
	const detail = `${selected.selector}: ${describeAllowance(selected, input)}`;
	return [`${selected.selector} selected for ${scope}: ${why}`, detail, ...others].join("; ");
}

/** Decide which candidate a new subagent runs on. Pure; see the module doc for the objective. */
export function decideRoute(input: RoutingPolicyInput): RoutingDecision {
	const bySelector = new Map(input.candidates.map(candidate => [candidate.selector, candidate]));
	const assessments = input.candidates.map(candidate => assess(candidate, input));
	const orderedByPreference = [...assessments].sort((a, b) => a.preference - b.preference);
	const healthy = rankHealthy(
		assessments.filter(assessment => assessment.effectiveState === "healthy"),
		input,
		bySelector,
	);
	const unknown = orderedByPreference.filter(assessment => assessment.effectiveState === "unknown");
	const reserve = [...assessments]
		.filter(assessment => assessment.effectiveState === "reserve")
		.sort((a, b) => (b.effectiveRemaining ?? 0) - (a.effectiveRemaining ?? 0) || a.preference - b.preference);
	const chain = [...healthy, ...unknown, ...reserve];

	const select = (
		chosen: RoutingCandidateAssessment,
		why: string,
		confidence: RoutingConfidence,
		strictFallbackOrder = false,
	): RoutingSelected => ({
		kind: "selected",
		selector: chosen.selector,
		provider: chosen.provider,
		modelId: chosen.modelId,
		patterns: eligiblePatterns(
			chosen,
			strictFallbackOrder ? orderedByPreference : chain,
			strictFallbackOrder,
			input.reservePolicy === "auto",
		),
		reason: explain(chosen, assessments, input, why),
		confidence,
		assessments,
	});

	const pinnedChoice = input.pinned ? choosePinned(orderedByPreference, input.reservePolicy) : undefined;
	if (pinnedChoice) {
		return select(pinnedChoice.assessment, pinnedChoice.why, pinnedChoice.confidence, true);
	}

	if (!input.pinned) {
		const [healthyChoice, runnerUp] = healthy;
		if (healthyChoice) {
			const why =
				runnerUp === undefined
					? healthy.length === assessments.length
						? "most sustainable headroom"
						: "only candidate with healthy allowance"
					: `headroom ${healthyChoice.slack !== undefined ? healthyChoice.slack.toFixed(2) : "?"} vs ${runnerUp.slack !== undefined ? runnerUp.slack.toFixed(2) : "?"} for ${runnerUp.selector}` +
						(Math.abs((healthyChoice.slack ?? 0) - (runnerUp.slack ?? 0)) <=
						input.tieTolerance * Math.max(Math.abs(healthyChoice.slack ?? 0), Math.abs(runnerUp.slack ?? 0))
							? " (comparable; alternating by recent dispatches)"
							: "");
			return select(healthyChoice, why, "high");
		}
		const [unknownChoice] = unknown;
		if (unknownChoice) {
			return select(
				unknownChoice,
				`no candidate has a reliable healthy report; configured preference kept (${unknownChoice.note})`,
				"low",
			);
		}
	}

	if (reserve.length > 0) {
		const listing = reserve.map(assessment => `${assessment.selector} ${assessment.note}`).join("; ");
		const [reserveChoice] = reserve;
		if (input.reservePolicy === "auto" && reserveChoice) {
			return select(
				reserveChoice,
				`every eligible candidate is inside the reserve; policy spends the largest remainder (${listing})`,
				"high",
			);
		}
		return {
			kind: "blocked",
			outcome: input.reservePolicy === "fail-closed" ? "fail-closed" : "reserve-confirm",
			reason:
				input.reservePolicy === "fail-closed"
					? `Every eligible candidate is inside the ${formatPercent(input.reserveFraction)} routing reserve and reservePolicy is fail-closed: ${listing}.`
					: `Every eligible candidate is inside the ${formatPercent(input.reserveFraction)} routing reserve: ${listing}. Wait for the reset, pass a model selector to pin one, or set reservePolicy to auto in the numen-quota-router config.`,
			earliestResetAt: earliestReset(reserve, input.now),
			assessments,
		};
	}

	const depleted = assessments.filter(assessment => assessment.effectiveState === "depleted");
	const unauthenticated = depleted.every(assessment => !assessment.authenticated);
	const listing = depleted.map(assessment => `${assessment.selector} ${assessment.note}`).join("; ");
	return {
		kind: "blocked",
		outcome: unauthenticated ? "unauthenticated" : "exhausted",
		reason: unauthenticated
			? `No candidate has a usable credential: ${listing}.`
			: `Every candidate's allowance is exhausted: ${listing}. Wait for the earliest reset or pin a model outside this pool.`,
		earliestResetAt: earliestReset(depleted, input.now),
		assessments,
	};
}
