// generated-by: numen-sync
/**
 * Quota-aware subagent routing, driven from OMP's `subagent_route` gate.
 *
 * Inputs are what the gate hands over: the expanded patterns the static
 * resolver produced and the pre-expansion selectors behind them. The router
 * turns those into a candidate pool, asks the auth layer for each candidate's
 * allowance state, folds in the cross-process in-flight ledger, and returns
 * the patterns the child should spawn with: selected model first, then the
 * eligible fallbacks so a runtime provider failure still lands somewhere
 * with headroom. A refusal names each candidate's state.
 */
import type { AuthStorage, ModelUsageAccountHealth, ModelUsageHealth } from "@oh-my-pi/pi-ai";
import type { Api, Model } from "@oh-my-pi/pi-ai";
import type { ExtensionContext, ModelRegistry } from "@oh-my-pi/pi-coding-agent";
import { isAuthenticated, kNoAuth, settings } from "@oh-my-pi/pi-coding-agent";
import { getAgentDir, logger } from "@oh-my-pi/pi-utils";
import { splitThinkingSuffix, splitUpstreamRouting } from "@oh-my-pi/pi-tui/overlays/model-selector";
import * as path from "node:path";
import { config, routingEnabled } from "./config";
import {
	decideRoute,
	ROUTING_POLICY_VERSION,
	type RoutingBlockedOutcome,
	type RoutingCandidate,
	type RoutingCandidateAssessment,
	type RoutingConfidence,
	type RoutingHealthSnapshot,
} from "./policy";
import { RoutingStore, type RoutingCompletion, type RoutingCostEstimate } from "./store";

export interface SubagentRoutingRequest {
	ctx: ExtensionContext;
	sessionId?: string;
	parentAgentId?: string;
	/** Reserved child agent id; keys the ledger reservation. */
	id: string;
	agent: string;
	role?: string;
	/** Expanded patterns from the static resolver, in configured order. */
	patterns: string[];
	/** Pre-expansion selectors behind `patterns`; empty when the child inherits the session model. */
	sourcePatterns: string[];
	effort?: string;
	now?: number;
	/** Ledger override for tests; production shares one file under the agent dir. */
	store?: RoutingStore;
}

/** What the parent shows and persists about one routing decision. */
export interface SubagentRoutingSummary {
	selector: string;
	reason: string;
	/** Selectors that would take over on runtime provider failure, in order. */
	fallbacks: string[];
	pinned: boolean;
	confidence: RoutingConfidence;
}

export interface SubagentRoutingOutcome {
	/** Patterns to spawn with: selected model first, then the eligible fallbacks. */
	patterns: string[];
	/** Undefined when routing did not apply (disabled, inherited model, no candidates). */
	summary?: SubagentRoutingSummary;
	/** Release the ledger reservation. Idempotent. */
	release: (completion: RoutingCompletion) => void;
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

const NOOP_RELEASE = (): void => {};
const NEVER_ABORTED = new AbortController().signal;

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
	return { base: thinking.base, level: thinking.level, upstream: routing?.upstream };
}

/** `provider/id` plus the thinking and upstream routing suffixes the selector carried, if any. */
function selectorFor(model: Model<Api>, pattern: string): string {
	const { level, upstream } = selectorParts(pattern);
	const routed = `${model.provider}/${model.id}${upstream ? `@${upstream}` : ""}`;
	return level ? `${routed}:${level}` : routed;
}

function resolveCandidates(selectors: readonly string[], ctx: ExtensionContext): ResolvedCandidate[] {
	const disabledProviders = new Set(settings.get("disabledProviders"));
	const candidates: ResolvedCandidate[] = [];
	const seen = new Set<string>();
	for (const pattern of selectors) {
		const model = ctx.models.resolve(pattern);
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

/** The alias's own `:level` suffix (`@task:high`), which the pool entries inherit when they carry none. */
function aliasThinkingSuffix(sourcePattern: string | undefined): string | undefined {
	if (!sourcePattern?.startsWith("@")) return undefined;
	return splitThinkingSuffix(sourcePattern).level;
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
 * Turn the static selection into the set the router may choose from.
 *
 * - Several pre-expansion selectors: the caller listed a pool.
 * - One role alias whose role has a `pools` entry: that pool.
 * - Anything else is a pin. Only the retry-fallback chain the policy already
 *   grants that role (or `default`) may stand in for it.
 */
function candidatePool(request: SubagentRoutingRequest): CandidatePool | undefined {
	const { sourcePatterns, patterns, role } = request;
	if (sourcePatterns.length === 0 || patterns.length === 0) return undefined;
	if (sourcePatterns.length > 1) return { selectors: patterns, pinned: false };
	const pool = role !== undefined ? config.pools[role] : undefined;
	if (pool && pool.length > 0) {
		const suffix = aliasThinkingSuffix(sourcePatterns[0]) ?? selectorParts(patterns[0]!).level;
		const selectors = pool.map(selector => withThinkingLevel(selector, suffix));
		return { selectors, pinned: false };
	}
	const chains = settings.get("retry.fallbackChains");
	const chain = (role !== undefined ? chains?.[role] : undefined) ?? chains?.default ?? [];
	return { selectors: [...patterns, ...chain], pinned: true };
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
	signal: AbortSignal,
) {
	let health: ModelUsageHealth;
	try {
		health = await authStorage.getModelUsageHealth(model.provider, {
			modelId: model.id,
			baseUrl: model.baseUrl,
			reserveFraction,
			sessionId,
			signal,
		});
	} catch (error) {
		logger.debug("numen-quota-router: usage lookup failed; candidate is unknown", {
			provider: model.provider,
			model: model.id,
			error: error instanceof Error ? error.message : "unknown error",
		});
		return {
			health: { state: "unknown", windows: [] } satisfies RoutingHealthSnapshot,
			credentialId: undefined,
		};
	}
	const account = pickAccount(health);
	return {
		health: {
			state: account?.state ?? health.state,
			remainingFraction: account?.remainingFraction,
			resetsAt: account?.resetsAt,
			fetchedAt: account?.fetchedAt,
			windows: account?.windows ?? [],
		},
		credentialId: account?.credentialId,
	};
}

/**
 * Route one fresh subagent. Returns the patterns to spawn with and a release
 * closure for the ledger; throws {@link SubagentRoutingError} when the policy
 * requires an explicit choice or every candidate is exhausted.
 */
export async function routeSubagentModel(request: SubagentRoutingRequest): Promise<SubagentRoutingOutcome> {
	const passthrough: SubagentRoutingOutcome = { patterns: request.patterns, release: NOOP_RELEASE };
	if (!routingEnabled()) return passthrough;
	const pool = candidatePool(request);
	if (!pool) return passthrough;
	const resolved = resolveCandidates(pool.selectors, request.ctx);

	const now = request.now ?? Date.now();
	const reserveFraction = Math.max(0, Math.min(1, config.reservePct / 100));
	const store = request.store ?? (await routingStore());
	const modelRegistry: ModelRegistry = request.ctx.modelRegistry;
	const authStorage = modelRegistry.authStorage;
	const signal = request.ctx.signal ?? NEVER_ABORTED;
	const evaluated = await Promise.all(
		resolved.map(async candidate => {
			if (!candidate.model) {
				return {
					...candidate,
					authenticated: false,
					health: { state: "unknown" as const, windows: [] },
					credentialId: undefined,
				};
			}
			const key = await modelRegistry.getApiKey(candidate.model, request.sessionId, { signal });
			const authenticated = key === kNoAuth || isAuthenticated(key);
			const result = authenticated
				? await healthOf(authStorage, candidate.model, reserveFraction, request.sessionId, signal)
				: {
						health: { state: "unknown" as const, windows: [] },
						credentialId: undefined,
					};
			return { ...candidate, authenticated, ...result };
		}),
	);
	for (const candidate of evaluated) {
		if (candidate.health.fetchedAt !== undefined && candidate.health.windows.length > 0 && candidate.credentialId !== undefined) {
			store.recordSnapshot(candidate.provider, candidate.credentialId, candidate.health.fetchedAt, candidate.health.windows);
		}
	}
	if (signal.aborted) return passthrough;

	const defaultCostFraction = Math.max(0, config.inflightEstimatePct) / 100;
	const outcome = store.transact(now, view => {
		const costByCredential = new Map<string, RoutingCostEstimate>();
		const costBySelector = new Map<string, RoutingCostEstimate>();
		const candidates: RoutingCandidate[] = evaluated.map(candidate => {
			const provider = candidate.provider;
			const costKey = `${provider}:${candidate.credentialId ?? "none"}`;
			let cost = costByCredential.get(costKey);
			if (!cost) {
				cost = view.estimateDispatchCost(provider, candidate.credentialId, defaultCostFraction);
				costByCredential.set(costKey, cost);
			}
			costBySelector.set(candidate.selector, cost);
			return {
				selector: candidate.selector,
				provider,
				modelId: candidate.modelId,
				preference: candidate.preference,
				authenticated: candidate.authenticated,
				unavailableReason: candidate.unavailableReason,
				health: candidate.health,
				inflight: view.inflight(provider),
				inflightCostFraction: cost.fraction,
				recentDispatches: view.recentDispatches(provider, now),
			};
		});
		const decision = decideRoute({
			now,
			agent: request.agent,
			role: request.role,
			pinned: pool.pinned,
			reserveFraction,
			reservePolicy: config.reservePolicy,
			staleAfterMs: config.staleReportMs,
			preferenceWeight: config.preferenceWeight,
			tieTolerance: config.tieTolerance,
			candidates,
		});
		if (decision.kind === "blocked") return decision;
		view.reserve({
			id: request.id,
			sessionId: request.sessionId,
			parentAgentId: request.parentAgentId,
			agent: request.agent,
			role: request.role,
			provider: decision.provider,
			modelId: decision.modelId,
			selector: decision.selector,
			effort: request.effort,
			pinned: pool.pinned,
			policyVersion: ROUTING_POLICY_VERSION,
			confidence: decision.confidence,
			reason: decision.reason,
			assessments: decision.assessments,
			costEstimateSource: costBySelector.get(decision.selector)?.source ?? "default",
			startedAt: now,
		});
		return decision;
	});

	if (outcome.kind === "blocked") {
		logger.warn("numen-quota-router: blocked", { agent: request.agent, role: request.role, outcome: outcome.outcome });
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
	let released = false;
	return {
		patterns: outcome.patterns,
		summary: {
			selector: outcome.selector,
			reason: outcome.reason,
			fallbacks: outcome.patterns.slice(1),
			pinned: pool.pinned,
			confidence: outcome.confidence,
		},
		release: completion => {
			if (released) return;
			released = true;
			try {
				store.complete(request.id, completion);
			} catch (error) {
				logger.warn("numen-quota-router: ledger release failed", {
					id: request.id,
					error: error instanceof Error ? error.message : "unknown error",
				});
			}
		},
	};
}
