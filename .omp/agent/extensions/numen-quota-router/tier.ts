// generated-by: numen-sync
import { logger } from "@oh-my-pi/pi-utils";
import { config, type TierOption } from "./config";

export interface TierDecision {
	option?: TierOption;
	rawWinner: string;
	probabilities: Record<string, number>;
	confidence: number;
	/** Fixed policy/diagnostic outcome, not an invented explanation from Jev. */
	reason: string;
}

function object(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function probability(value: unknown): value is number {
	return (
		typeof value === "number" &&
		Number.isFinite(value) &&
		value >= 0 &&
		value <= 1
	);
}

function defaultDecision(reason: string): TierDecision {
	return { rawWinner: "configured", probabilities: {}, confidence: 0, reason };
}

let missingKeyLogged = false;
export function jevKeyAvailable(): boolean {
	if (process.env.TYPESAFE_API_KEY) return true;
	if (!missingKeyLogged) {
		logger.debug(
			"numen-quota-router: TYPESAFE_API_KEY missing; Jev routing disabled",
		);
		missingKeyLogged = true;
	}
	return false;
}

function costRank(option: TierOption): number {
	return Number.isFinite(option.costRank) && option.costRank > 0
		? option.costRank
		: Number.POSITIVE_INFINITY;
}

function decisionFromJev(data: unknown, active: TierOption[]): TierDecision {
	if (!object(data) || !object(data.answers) || !object(data.answers.tier))
		return defaultDecision("invalid-response");
	const tier = data.answers.tier;
	const choice = typeof tier.choice === "string" ? tier.choice : undefined;
	if (
		choice &&
		config.tiers.options.some(
			(option) => option.id === choice && !option.active,
		)
	)
		return { ...defaultDecision("disabled-choice"), rawWinner: choice };
	if (
		choice &&
		config.tiers.options.some(
			(option) => option.id === choice && option.active,
		) &&
		!active.some((option) => option.id === choice)
	)
		return { ...defaultDecision("unavailable-choice"), rawWinner: choice };
	const winner = active.find((option) => option.id === choice);
	const probabilities = object(tier.probabilities)
		? tier.probabilities
		: undefined;
	if (
		tier.type !== "choice" ||
		!choice ||
		!winner ||
		!probability(tier.confidence) ||
		!probabilities ||
		!active.every((option) => probability(probabilities[option.id]))
	)
		return defaultDecision("invalid-response");
	const scores = Object.fromEntries(
		active.map((option) => [option.id, probabilities[option.id] as number]),
	);
	const base = {
		rawWinner: choice,
		probabilities: scores,
		confidence: tier.confidence,
	};
	if (tier.confidence < config.tiers.minConfidence)
		return { ...base, reason: "low-confidence" };
	const bestProbability = Math.max(...Object.values(scores));
	const tolerance = Math.max(
		0,
		Math.min(1, config.tiers.probabilityTieTolerance),
	);
	if (
		bestProbability - (scores[choice] ?? Number.NEGATIVE_INFINITY) >
		tolerance + Number.EPSILON
	)
		return { ...base, reason: "invalid-response" };
	const suitable = active.filter(
		(option) =>
			bestProbability - (scores[option.id] ?? Number.NEGATIVE_INFINITY) <=
			tolerance + Number.EPSILON,
	);
	suitable.sort((a, b) => {
		const rankA = costRank(a);
		const rankB = costRank(b);
		if (rankA !== rankB) return rankA < rankB ? -1 : 1;
		return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
	});
	const option = suitable[0];
	return {
		...base,
		option,
		reason: option?.requiresEscalationEvidence
			? "justified-escalation"
			: option?.id === choice
				? "selected"
				: "cost-tie-break",
	};
}

/** Best-effort removal of obvious credentials; no files or ambient repository context are collected. */
function redact(text: string): string {
	return text
		.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
		.replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]")
		.replace(
			/(["']?\b[A-Z0-9_]*(?:API[_-]?KEY|ACCESS[_-]?TOKEN|REFRESH[_-]?TOKEN|PASSWORD|SECRET|AUTHORIZATION)[A-Z0-9_]*["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}\]]+)/gi,
			"$1[REDACTED]",
		);
}

/** Fit the encoded addition to an initially empty JSON string, including escaped characters. */
function fitText(text: string, extraBudget: number): string {
	let low = 0;
	let high = text.length;
	while (low < high) {
		const middle = Math.ceil((low + high) / 2);
		if (JSON.stringify(text.slice(0, middle)).length - 2 <= extraBudget)
			low = middle;
		else high = middle - 1;
	}
	return text.slice(0, low);
}

const METADATA_KEYS = [
	"solutionSpace",
	"ambiguity",
	"affectedBoundaries",
	"verification",
	"consequences",
	"escalationEvidence",
] as const;
function taskMetadata(
	input: Record<string, unknown> | undefined,
): Record<string, string> {
	// OMP's batch validator keeps solutionSpace but strips unknown per-task fields.
	const solutionSpace =
		typeof input?.solutionSpace === "string" ? input.solutionSpace : "";
	const marker = solutionSpace
		.slice(0, 8000)
		.match(/^Escalation evidence:[ \t]*(.+)$/im)?.[1]
		?.trim();
	const source =
		input?.escalationEvidence === undefined && marker
			? { ...input, escalationEvidence: marker }
			: input;
	const values: Array<[string, string]> = [];
	for (const key of METADATA_KEYS) {
		const raw = source?.[key];
		const value =
			typeof raw === "string"
				? raw
				: key !== "escalationEvidence" &&
						Array.isArray(raw) &&
						raw.every((item) => typeof item === "string")
					? raw.slice(0, 16).join("; ")
					: undefined;
		if (value !== undefined) values.push([key, redact(value)]);
	}
	if (values.length === 0) return {};
	const empty = Object.fromEntries(values.map(([key]) => [key, ""]));
	// Every supplied field retains its own share; a large solution space cannot erase consequences or verification.
	const fieldBudget = Math.floor(
		(2000 - JSON.stringify(empty).length) / values.length,
	);
	return Object.fromEntries(
		values.map(([key, value]) => [key, fitText(value, fieldBudget)]),
	);
}

function classifierState(
	agent: string,
	assignment: string,
	context: string | undefined,
	metadata: Record<string, unknown> | undefined,
) {
	const budget = Math.min(12000, Math.max(0, config.tiers.maxStateChars));
	const state = {
		agent: redact(agent).slice(0, 100),
		assignment: "",
		context: "",
		taskMetadata: taskMetadata(metadata),
	};
	if (JSON.stringify(state).length > budget) return undefined;
	state.assignment = fitText(
		redact(assignment).slice(0, 8000),
		budget - JSON.stringify(state).length,
	);
	state.context = fitText(
		redact(context ?? ""),
		budget - JSON.stringify(state).length,
	);
	return state;
}

export async function classifyAssignment({
	agent,
	assignment,
	context,
	metadata,
}: {
	agent: string;
	assignment: string;
	context?: string;
	metadata?: Record<string, unknown>;
}): Promise<TierDecision> {
	const key = process.env.TYPESAFE_API_KEY;
	if (!key) {
		jevKeyAvailable();
		return defaultDecision("no-key");
	}
	const state = classifierState(agent, assignment, context, metadata);
	const hasEscalationEvidence = Boolean(
		state?.taskMetadata.escalationEvidence?.trim(),
	);
	const active = config.tiers.options.filter(
		(option) =>
			option.active &&
			(!option.requiresEscalationEvidence || hasEscalationEvidence),
	);
	if (!state || active.length === 0) return defaultDecision("invalid-config");
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), config.tiers.timeoutMs);
	let readingResponse = false;
	try {
		const response = await fetch("https://api.typesafe.ai/v1/systemone", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${key}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: config.tiers.model,
				state,
				questions: {
					tier: {
						type: "choice",
						instructions: config.tiers.instructions,
						criteria: Object.fromEntries(
							active.map((option) => [
								option.id,
								{
									what: `${option.criteria.what} Relative total-work cost rank: ${Number.isFinite(costRank(option)) ? costRank(option) : "unknown"}; actual cash price is unknown.`,
									not_for: option.criteria.not_for,
								},
							]),
						),
					},
				},
			}),
			signal: controller.signal,
		});
		if (!response.ok) {
			logger.warn("numen-quota-router: Jev classification failed", {
				reason: "http-error",
				status: response.status,
			});
			return defaultDecision("http-error");
		}
		readingResponse = true;
		const decision = decisionFromJev(await response.json(), active);
		if (
			decision.reason === "invalid-response" ||
			decision.reason === "disabled-choice" ||
			decision.reason === "unavailable-choice"
		)
			logger.warn("numen-quota-router: Jev classification rejected", {
				reason: decision.reason,
			});
		return decision;
	} catch (error) {
		const reason = controller.signal.aborted
			? "timeout"
			: readingResponse
				? "invalid-response"
				: "request-failed";
		const errorType =
			error instanceof Error &&
			["AbortError", "TypeError", "SyntaxError"].includes(error.name)
				? error.name
				: "Error";
		logger.warn("numen-quota-router: Jev classification failed", {
			reason,
			errorType,
		});
		return defaultDecision(reason);
	} finally {
		clearTimeout(timeout);
	}
}
