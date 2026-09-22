// generated-by: numen-sync
/**
 * Quota-aware subagent routing: the pure decision.
 *
 * Given a role's candidate models with their observed allowance state and the
 * dispatches already in flight, pick the model a new subagent should run on.
 * Nothing here performs I/O or consults a clock; the caller supplies `now`, the
 * usage snapshots and the shared dispatch counts, which is what makes every
 * branch reproducible under test.
 *
 * The objective is useful work per allowance consumed, not an equal task split:
 * a candidate is scored by how far ahead of its own reset pace it is, healthy
 * candidates with comparable headroom alternate by recent dispatch count so
 * every subscription stays productive, and a candidate stops receiving new
 * work before its allowance crosses the reserve margin.
 */

export const ROUTING_POLICY_VERSION = 1;

export type RoutingHealthState = "healthy" | "reserve" | "depleted" | "unknown";

export type RoutingReservePolicy = "confirm" | "auto" | "fail-closed";

/** One quota window bounding a candidate, as reported by its provider. */
export interface RoutingWindowSnapshot {
	id: string;
	label: string;
	/** Fraction of the window's allowance still available (0..1). */
	remainingFraction: number;
	resetsAt?: number;
	durationMs?: number;
}

/** Provider-reported allowance state for one candidate. */
export interface RoutingHealthSnapshot {
	state: RoutingHealthState;
	/** Minimum remaining fraction across windows, when the report was quantitative. */
	remainingFraction?: number;
	/** Earliest reset that would lift a depleted verdict. */
	resetsAt?: number;
	/** When the underlying report was fetched. Absent when no report existed. */
	fetchedAt?: number;
	windows: RoutingWindowSnapshot[];
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
	/** Dispatches currently running against this provider's allowance, across every session. */
	inflight: number;
	/**
	 * Estimated fraction of the provider's allowance one running dispatch will
	 * still consume. An estimate: external clients move the same quota.
	 */
	inflightCostFraction: number;
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
	/** Reports older than this count as no evidence. */
	staleAfterMs: number;
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
	/** State after subtracting in-flight load and applying staleness. */
	effectiveState: RoutingHealthState;
	reportedState: RoutingHealthState;
	/** Minimum remaining fraction after in-flight load, when known. */
	effectiveRemaining?: number;
	/** Headroom above the reserve per unit of window time left; higher spends more sustainably. */
	slack?: number;
	inflight: number;
	fetchedAt?: number;
	stale: boolean;
	windows: RoutingWindowSnapshot[];
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

const MIN_TIME_LEFT_FRACTION = 0.05;

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

function formatAge(fetchedAt: number | undefined, now: number): string {
	if (fetchedAt === undefined) return "no report";
	const ageMinutes = Math.max(0, Math.round((now - fetchedAt) / 60_000));
	return ageMinutes < 1 ? "report <1m old" : `report ${ageMinutes}m old`;
}

function describeWindows(assessment: RoutingCandidateAssessment, input: RoutingPolicyInput): string {
	if (assessment.windows.length === 0) {
		return assessment.effectiveRemaining === undefined
			? assessment.reportedState
			: `${formatPercent(assessment.effectiveRemaining)} left`;
	}
	const load = assessment.inflight > 0 ? `, ${assessment.inflight} in flight` : "";
	return (
		assessment.windows
			.map(window => `${window.label} ${formatPercent(window.remainingFraction)} (${formatResetAt(window.resetsAt, input.now)})`)
			.join(", ") + load
	);
}

function assess(candidate: RoutingCandidate, input: RoutingPolicyInput): RoutingCandidateAssessment {
	const { health } = candidate;
	const stale = health.fetchedAt !== undefined && input.now - health.fetchedAt > input.staleAfterMs;
	const base: RoutingCandidateAssessment = {
		selector: candidate.selector,
		provider: candidate.provider,
		modelId: candidate.modelId,
		preference: candidate.preference,
		authenticated: candidate.authenticated,
		effectiveState: "unknown",
		reportedState: health.state,
		inflight: candidate.inflight,
		fetchedAt: health.fetchedAt,
		stale,
		windows: health.windows,
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
		return { ...base, effectiveState: "depleted", note: `exhausted (${formatResetAt(health.resetsAt, input.now)})` };
	}
	if (health.state === "unknown" || stale) {
		return {
			...base,
			effectiveState: "unknown",
			note: stale ? `usage report stale (${formatAge(health.fetchedAt, input.now)})` : "no reliable usage report",
		};
	}
	const load = candidate.inflight * candidate.inflightCostFraction;
	const windows = health.windows.length > 0
		? health.windows
		: health.remainingFraction !== undefined
			? [{ id: "total", label: "allowance", remainingFraction: health.remainingFraction }]
			: [];
	if (windows.length === 0) {
		return { ...base, effectiveState: "unknown", note: "usage report carries no quantitative window" };
	}
	let effectiveRemaining = Number.POSITIVE_INFINITY;
	let slack = Number.POSITIVE_INFINITY;
	let bindingReset: number | undefined;
	for (const window of windows) {
		const remaining = Math.max(0, window.remainingFraction - load);
		if (remaining < effectiveRemaining) {
			effectiveRemaining = remaining;
			bindingReset = window.resetsAt;
		}
		const timeLeftFraction =
			window.resetsAt !== undefined && window.durationMs !== undefined && window.durationMs > 0
				? Math.min(1, Math.max(0, (window.resetsAt - input.now) / window.durationMs))
				: 1;
		const windowSlack = (remaining - input.reserveFraction) / Math.max(timeLeftFraction, MIN_TIME_LEFT_FRACTION);
		if (windowSlack < slack) slack = windowSlack;
	}
	const inReserve = effectiveRemaining <= input.reserveFraction;
	return {
		...base,
		effectiveState: inReserve ? "reserve" : "healthy",
		effectiveRemaining,
		slack,
		resetsAt: bindingReset ?? health.resetsAt,
		note: inReserve
			? `inside ${formatPercent(input.reserveFraction)} reserve (${formatPercent(effectiveRemaining)} left${load > 0 ? " after in-flight load" : ""}, ${formatResetAt(bindingReset, input.now)})`
			: `${formatPercent(effectiveRemaining)} left${load > 0 ? " after in-flight load" : ""} (${formatResetAt(bindingReset, input.now)})`,
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
): string[] {
	const patterns = [selected.selector];
	for (const assessment of ordered) {
		if (assessment.selector === selected.selector || assessment.effectiveState === "depleted") continue;
		if (!patterns.includes(assessment.selector)) patterns.push(assessment.selector);
	}
	return patterns;
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
	const detail = `${selected.selector}: ${describeWindows(selected, input)}, ${formatAge(selected.fetchedAt, input.now)}`;
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
	): RoutingSelected => ({
		kind: "selected",
		selector: chosen.selector,
		provider: chosen.provider,
		modelId: chosen.modelId,
		patterns: eligiblePatterns(chosen, chain),
		reason: explain(chosen, assessments, input, why),
		confidence,
		assessments,
	});

	if (input.pinned) {
		const pin = orderedByPreference[0]!;
		if (pin.effectiveState === "healthy") return select(pin, "explicit pin, allowance healthy", "high");
		if (pin.effectiveState === "unknown") return select(pin, `explicit pin kept, ${pin.note}`, "low");
		// The pin is inside reserve or exhausted: only the fallbacks the policy
		// explicitly listed after it may take its place.
		const permitted = chain.find(
			assessment => assessment.selector !== pin.selector && assessment.effectiveState === "healthy",
		);
		if (permitted) {
			return select(permitted, `pinned ${pin.selector} ${pin.note}; permitted fallback is healthy`, "high");
		}
		const permittedUnknown = unknown.find(assessment => assessment.selector !== pin.selector);
		if (permittedUnknown) {
			return select(permittedUnknown, `pinned ${pin.selector} ${pin.note}; permitted fallback has ${permittedUnknown.note}`, "low");
		}
	}

	if (!input.pinned) {
		if (healthy.length > 0) {
			const chosen = healthy[0]!;
			const runnerUp = healthy[1];
			const why =
				runnerUp === undefined
					? healthy.length === assessments.length
						? "most sustainable headroom"
						: "only candidate with healthy allowance"
					: `headroom ${chosen.slack !== undefined ? chosen.slack.toFixed(2) : "?"} vs ${runnerUp.slack !== undefined ? runnerUp.slack.toFixed(2) : "?"} for ${runnerUp.selector}` +
						(Math.abs((chosen.slack ?? 0) - (runnerUp.slack ?? 0)) <=
						input.tieTolerance * Math.max(Math.abs(chosen.slack ?? 0), Math.abs(runnerUp.slack ?? 0))
							? " (comparable; alternating by recent dispatches)"
							: "");
			return select(chosen, why, "high");
		}
		if (unknown.length > 0) {
			const chosen = unknown[0]!;
			return select(chosen, `no candidate has a reliable healthy report; configured preference kept (${chosen.note})`, "low");
		}
	}

	if (reserve.length > 0) {
		const listing = reserve.map(assessment => `${assessment.selector} ${assessment.note}`).join("; ");
		if (input.reservePolicy === "auto") {
			const chosen = reserve[0]!;
			return select(chosen, `every eligible candidate is inside the reserve; policy spends the largest remainder (${listing})`, "high");
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
