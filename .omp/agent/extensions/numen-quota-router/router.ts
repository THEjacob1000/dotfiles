// generated-by: numen-sync
/**
 * Quota-aware subagent routing at OMP's supported pre-spawn hook.
 *
 * The router evaluates the expanded model patterns once, records the
 * dispatch-time decision, and returns the selected model plus ordered runtime
 * fallbacks. It does not claim child lifecycle or completion visibility.
 */

import * as path from "node:path";
import type { Api, AuthStorage, Model, ModelUsageAccountHealth, ModelUsageHealth } from "@oh-my-pi/pi-ai";
import type { ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import { isAuthenticated, kNoAuth, settings } from "@oh-my-pi/pi-coding-agent";
import { cfgDisabledProviders } from "@oh-my-pi/pi-coding-agent/config/model-settings";
import { cfgRetryFallbackChains } from "@oh-my-pi/pi-coding-agent/session/settings";
import { splitThinkingSuffix, splitUpstreamRouting } from "@oh-my-pi/pi-tui/overlays/model-selector";
import { getAgentDir, logger } from "@oh-my-pi/pi-utils";
import { config, routingEnabled } from "./config";
import {
	decideRoute,
	ROUTING_POLICY_VERSION,
	type RoutingBlockedOutcome,
	type RoutingCandidate,
	type RoutingCandidateAssessment,
	type RoutingHealthSnapshot,
} from "./policy";
import { RoutingStore } from "./store";

interface SubagentRoutingRequest {
	ctx: ExtensionContext;
	sessionId?: string;
	id: string;
	agent: string;
	role?: string;
	/** Expanded patterns from the static resolver, in configured order. */
	patterns: string[];
	now?: number;
	/** Ledger override for tests; production shares one file under the agent dir. */
	store?: RoutingStore;
}

interface SubagentRoutingOutcome {
	/** Patterns to spawn with: selected model first, then the eligible fallbacks. */
	patterns: string[];
	/** Undefined when routing did not apply (disabled, inherited model, no candidates). */
	reason?: string;
}

/** Routing refused to dispatch; the message names each candidate's state and the operator's choices. */
export class SubagentRoutingError extends Error {
	readonly outcome: RoutingBlockedOutcome;
	readonly earliestResetAt: number | undefined;
	readonly assessments: RoutingCandidateAssessment[];

	constructor(
		outcome: RoutingBlockedOutcome,
		message: string,
		earliestResetAt: number | undefined,
		assessments: RoutingCandidateAssessment[],
	) {
		super(message);
		this.name = "SubagentRoutingError";
		this.outcome = outcome;
		this.earliestResetAt = earliestResetAt;
		this.assessments = assessments;
	}
}

let sharedStore: Promise<RoutingStore> | undefined;

/** The one ledger every OMP process on this machine shares. */
export function routingStore(): Promise<RoutingStore> {
	sharedStore ??= RoutingStore.open(path.join(getAgentDir(), "data", "numen-quota-router.db"));
	return sharedStore;
}

interface ResolvedCandidate {
	selector: string;
	model?: Model<Api>;
	provider: string;
	modelId: string;
	preference: number;
	unavailableReason?: string;
}

function selectorParts(pattern: string) {
	const routing = splitUpstreamRouting(pattern);
	const thinking = splitThinkingSuffix(routing?.base ?? pattern);
	return {
		base: thinking.base,
		level: thinking.level,
		upstream: routing?.upstream,
	};
}

/** `provider/id` plus the thinking and upstream routing suffixes the selector carried, if any. */
function selectorFor(model: Model<Api>, pattern: string): string {
	const { level, upstream } = selectorParts(pattern);
	const routed = `${model.provider}/${model.id}${upstream ? `@${upstream}` : ""}`;
	return level ? `${routed}:${level}` : routed;
}

function isExactQualifiedMatch(pattern: string, model: Model<Api>): boolean {
	const base = selectorParts(pattern).base;
	const slash = base.indexOf("/");
	if (slash <= 0) return true;
	return model.provider.toLowerCase() === base.slice(0, slash).toLowerCase() && model.id === base.slice(slash + 1);
}

function resolveCandidates(
	selectors: readonly string[],
	ctx: ExtensionContext,
	strictFallbacks: boolean,
): ResolvedCandidate[] {
	const disabledProviders = new Set(cfgDisabledProviders.get(settings));
	const candidates: ResolvedCandidate[] = [];
	const seen = new Set<string>();
	for (const [index, pattern] of selectors.entries()) {
		const matched = ctx.models.resolve(pattern);
		const model =
			strictFallbacks && index > 0 && matched && !isExactQualifiedMatch(pattern, matched) ? undefined : matched;
		const selector = model ? selectorFor(model, pattern) : pattern;
		if (seen.has(selector)) continue;
		seen.add(selector);
		if (model && !disabledProviders.has(model.provider)) {
			candidates.push({
				selector,
				model,
				provider: model.provider,
				modelId: model.id,
				preference: candidates.length,
			});
			continue;
		}
		const base = selectorParts(pattern).base;
		const slash = base.indexOf("/");
		candidates.push({
			selector,
			provider: slash > 0 ? base.slice(0, slash) : base,
			modelId: slash > 0 ? base.slice(slash + 1) : base,
			preference: candidates.length,
			unavailableReason: "not resolvable: no credential or provider disabled",
		});
	}
	return candidates;
}

function withThinkingLevel(selector: string, level: string | undefined) {
	if (!level) return selector;
	const parts = selectorParts(selector);
	if (parts.level) return selector;
	const routed = `${parts.base}${parts.upstream ? `@${parts.upstream}` : ""}`;
	return `${routed}:${level}`;
}

interface CandidatePool {
	selectors: string[];
	pinned: boolean;
}

/**
 * Turn the supported hook's ordered attempt list into routing candidates.
 *
 * - A role with an explicit `pools` entry is quota-balanced within that pool.
 * - Every other list remains pinned to its first model; configured retry
 *   fallbacks are appended after the caller's own authoritative order.
 */
function candidatePool(request: SubagentRoutingRequest): CandidatePool | undefined {
	const { patterns, role } = request;
	const primary = patterns[0];
	if (primary === undefined) return undefined;
	const pool = role !== undefined ? config.pools[role] : undefined;
	if (pool && pool.length > 0) {
		const suffix = selectorParts(primary).level;
		return {
			selectors: pool.map(selector => withThinkingLevel(selector, suffix)),
			pinned: false,
		};
	}
	const chains = cfgRetryFallbackChains.get(settings);
	const { base, level } = selectorParts(primary);
	const chain =
		chains?.[primary] ?? chains?.[base] ?? (role !== undefined ? chains?.[role] : undefined) ?? chains?.default ?? [];
	return {
		selectors: [...patterns, ...chain.map(selector => withThinkingLevel(selector, level))],
		pinned: true,
	};
}

function pickAccount(health: ModelUsageHealth): ModelUsageAccountHealth | undefined {
	const live = health.accounts.filter(account => account.state !== "depleted");
	const pool = live.length > 0 ? live : health.accounts;
	return (
		pool.find(account => account.selected) ??
		pool.reduce<ModelUsageAccountHealth | undefined>(
			(best, account) =>
				best === undefined || (account.remainingFraction ?? -1) > (best.remainingFraction ?? -1) ? account : best,
			undefined,
		)
	);
}

async function healthOf(
	authStorage: AuthStorage,
	model: Model<Api>,
	reserveFraction: number,
	sessionId: string | undefined,
): Promise<RoutingHealthSnapshot> {
	let health: ModelUsageHealth;
	try {
		health = await authStorage.getModelUsageHealth(model.provider, {
			modelId: model.id,
			baseUrl: model.baseUrl,
			reserveFraction,
			sessionId,
		});
	} catch (error) {
		logger.debug("numen-quota-router: usage lookup failed; candidate is unknown", {
			provider: model.provider,
			model: model.id,
			error: error instanceof Error ? error.message : "unknown error",
		});
		return { state: "unknown" };
	}
	const account = pickAccount(health);
	return {
		state: account?.state ?? health.state,
		remainingFraction: account?.remainingFraction,
		resetsAt: account?.resetsAt,
	};
}

/**
 * Route one fresh subagent and persist its dispatch-time decision; throws
 * {@link SubagentRoutingError} when policy refuses the spawn.
 */
export async function routeSubagentModel(request: SubagentRoutingRequest): Promise<SubagentRoutingOutcome> {
	const passthrough: SubagentRoutingOutcome = { patterns: request.patterns };
	if (!routingEnabled()) return passthrough;
	const pool = candidatePool(request);
	if (!pool) return passthrough;
	const resolved = resolveCandidates(pool.selectors, request.ctx, pool.pinned);

	const now = request.now ?? Date.now();
	const reserveFraction = Math.max(0, Math.min(1, config.reservePct / 100));
	const store = request.store ?? (await routingStore());
	const modelRegistry = request.ctx.modelRegistry;
	const authStorage = modelRegistry.authStorage;
	const evaluated = await Promise.all(
		resolved.map(async candidate => {
			if (!candidate.model) {
				return {
					...candidate,
					authenticated: false,
					health: { state: "unknown" as const },
				};
			}
			const key = await modelRegistry.getApiKey(candidate.model, request.sessionId);
			const authenticated = key === kNoAuth || isAuthenticated(key);
			const health = authenticated
				? await healthOf(authStorage, candidate.model, reserveFraction, request.sessionId)
				: { state: "unknown" as const };
			return { ...candidate, authenticated, health };
		}),
	);

	const outcome = store.transact(view => {
		const candidates: RoutingCandidate[] = evaluated.map(candidate => ({
			selector: candidate.selector,
			provider: candidate.provider,
			modelId: candidate.modelId,
			preference: candidate.preference,
			authenticated: candidate.authenticated,
			unavailableReason: candidate.unavailableReason,
			health: candidate.health,
			recentDispatches: view.recentDispatches(candidate.provider, now),
		}));
		const decision = decideRoute({
			now,
			agent: request.agent,
			role: request.role,
			pinned: pool.pinned,
			reserveFraction,
			reservePolicy: config.reservePolicy,
			preferenceWeight: config.preferenceWeight,
			tieTolerance: config.tieTolerance,
			candidates,
		});
		if (decision.kind === "blocked") return decision;
		view.recordDecision({
			id: request.id,
			sessionId: request.sessionId,
			agent: request.agent,
			role: request.role,
			provider: decision.provider,
			modelId: decision.modelId,
			selector: decision.selector,
			pinned: pool.pinned,
			policyVersion: ROUTING_POLICY_VERSION,
			confidence: decision.confidence,
			reason: decision.reason,
			assessments: decision.assessments,
			startedAt: now,
		});
		return decision;
	});

	if (outcome.kind === "blocked") {
		logger.warn("numen-quota-router: blocked", {
			agent: request.agent,
			role: request.role,
			outcome: outcome.outcome,
		});
		throw new SubagentRoutingError(outcome.outcome, outcome.reason, outcome.earliestResetAt, outcome.assessments);
	}
	logger.info("numen-quota-router: routed", {
		id: request.id,
		agent: request.agent,
		role: request.role,
		selector: outcome.selector,
		confidence: outcome.confidence,
		pinned: pool.pinned,
		reason: outcome.reason,
	});
	return { patterns: outcome.patterns, reason: outcome.reason };
}
