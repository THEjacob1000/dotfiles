// generated-by: numen-sync
import { logger } from "@oh-my-pi/pi-utils";
import { config, type TierConfig } from "./config";

export interface TierDecision {
	option?: TierConfig["options"][number];
	rawWinner: string;
	probabilities: Record<string, number>;
	confidence: number;
}

function object(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function probability(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

let missingKeyLogged = false;
export function jevKeyAvailable(): boolean {
	if (process.env.TYPESAFE_API_KEY) return true;
	if (!missingKeyLogged) {
		logger.debug("numen-quota-router: TYPESAFE_API_KEY missing; Jev routing disabled");
		missingKeyLogged = true;
	}
	return false;
}

function decisionFromJev(data: unknown): TierDecision | undefined {
	if (!object(data) || !object(data.answers) || !object(data.answers.tier)) {
		throw new Error("malformed answers");
	}
	const tier = data.answers.tier;
	const choice = typeof tier.choice === "string" ? tier.choice : undefined;
	const probabilities = object(tier.probabilities) ? tier.probabilities : undefined;
	const winner = config.tiers.options.find(option => option.id === choice);
	if (
		tier.type !== "choice" ||
		!choice ||
		!winner ||
		!probability(tier.confidence) ||
		!probabilities ||
		!config.tiers.options.every(option => probability(probabilities[option.id]))
	)
		throw new Error("malformed classification");
	if (tier.confidence < config.tiers.minConfidence) return undefined;
	const bestActive = config.tiers.options
		.filter(candidate => candidate.active)
		.reduce<TierConfig["options"][number] | undefined>(
			(best, candidate) =>
				!best || (probabilities[candidate.id] as number) >= (probabilities[best.id] as number) ? candidate : best,
			undefined,
		);
	if (!bestActive) throw new Error("no active option");
	const option = winner?.active
		? winner
		: (probabilities[bestActive.id] as number) >= config.tiers.shadowFloor
			? bestActive
			: undefined;
	const scores: Record<string, number> = {};
	for (const candidate of config.tiers.options) scores[candidate.id] = probabilities[candidate.id] as number;
	return { option, rawWinner: choice, probabilities: scores, confidence: tier.confidence };
}

export async function classifyAssignment({
	agent,
	assignment,
	context,
}: {
	agent: string;
	assignment: string;
	context?: string;
}): Promise<TierDecision | undefined> {
	const key = process.env.TYPESAFE_API_KEY;
	if (!key) {
		jevKeyAvailable();
		return undefined;
	}
	const budget = Math.max(0, config.tiers.maxStateChars);
	const task = assignment.slice(0, Math.min(8000, budget));
	const name = agent.slice(0, Math.max(0, budget - task.length));
	const shared = context?.slice(0, Math.max(0, budget - task.length - name.length));
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), config.tiers.timeoutMs);
	try {
		const response = await fetch("https://api.typesafe.ai/v1/systemone", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${key}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: config.tiers.model,
				state: { agent: name, assignment: task, context: shared ?? "" },
				questions: {
					tier: {
						type: "choice",
						instructions: config.tiers.instructions,
						criteria: Object.fromEntries(config.tiers.options.map(option => [option.id, option.criteria])),
					},
				},
			}),
			signal: controller.signal,
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return decisionFromJev(await response.json());
	} catch (error) {
		logger.warn("numen-quota-router: Jev classification failed", {
			error: error instanceof Error ? error.message : "unknown error",
		});
		return undefined;
	} finally {
		clearTimeout(timeout);
	}
}
