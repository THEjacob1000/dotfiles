// generated-by: numen-sync
/**
 * Shared dispatch ledger for quota-aware subagent routing.
 *
 * Every OMP process on the machine records the subagents it routes in one
 * SQLite file, so concurrent spawns across sessions see each other's in-flight
 * load instead of all reading the same cached usage snapshot and landing on
 * the same provider. A row is a local reservation for accounting, never a
 * provider-side quota deduction. Rows are released on completion, failure and
 * cancellation; a row whose process died is swept as orphaned on the next
 * transaction.
 */
import { Database } from "bun:sqlite";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { openSqliteDatabase } from "@oh-my-pi/pi-utils";
import { splitThinkingSuffix, splitUpstreamRouting } from "@oh-my-pi/pi-tui/overlays/model-selector";
import type { RoutingCandidateAssessment, RoutingConfidence, RoutingWindowSnapshot } from "./policy";

const SCHEMA_VERSION = 2;
const ORPHAN_AFTER_MS = 2 * 60 * 60 * 1000;
const RECENT_DISPATCH_WINDOW_MS = 5 * 60 * 60 * 1000;
const OBSERVED_SAMPLE_SIZE = 20;
const MAX_ESTIMATED_COST_FRACTION = 0.25;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS dispatches (
	id TEXT PRIMARY KEY,
	session_id TEXT,
	parent_agent_id TEXT,
	pid INTEGER NOT NULL,
	host TEXT NOT NULL,
	agent TEXT NOT NULL,
	role TEXT,
	provider TEXT NOT NULL,
	model_id TEXT NOT NULL,
	selector TEXT NOT NULL,
	effort TEXT,
	pinned INTEGER NOT NULL,
	policy_version INTEGER NOT NULL,
	confidence TEXT NOT NULL,
	reason TEXT NOT NULL,
	candidates_json TEXT NOT NULL,
	cost_estimate_source TEXT NOT NULL,
	started_at INTEGER NOT NULL,
	ended_at INTEGER,
	outcome TEXT,
	final_selector TEXT,
	model_changed INTEGER,
	retries INTEGER,
	input_tokens INTEGER,
	output_tokens INTEGER,
	cache_read_tokens INTEGER,
	cache_write_tokens INTEGER,
	total_tokens INTEGER,
	cost_usd REAL
);
CREATE INDEX IF NOT EXISTS dispatches_provider_started ON dispatches(provider, started_at);
CREATE INDEX IF NOT EXISTS dispatches_open ON dispatches(ended_at) WHERE ended_at IS NULL;
CREATE TABLE IF NOT EXISTS usage_snapshots (
	provider TEXT NOT NULL,
	credential_id INTEGER NOT NULL,
	window_id TEXT NOT NULL,
	fetched_at INTEGER NOT NULL,
	remaining_fraction REAL NOT NULL,
	resets_at INTEGER,
	duration_ms INTEGER,
	PRIMARY KEY (provider, credential_id, window_id, fetched_at)
);
`;

export type RoutingDispatchOutcome = "completed" | "failed" | "aborted" | "orphaned";

export interface RoutingReservation {
	id: string;
	sessionId?: string;
	parentAgentId?: string;
	agent: string;
	role?: string;
	provider: string;
	modelId: string;
	selector: string;
	effort?: string;
	pinned: boolean;
	policyVersion: number;
	confidence: RoutingConfidence;
	reason: string;
	assessments: RoutingCandidateAssessment[];
	costEstimateSource: "observed" | "default";
	startedAt: number;
}

export interface RoutingCompletion {
	outcome: RoutingDispatchOutcome;
	endedAt: number;
	finalSelector?: string;
	retries?: number;
	usage?: {
		input: number;
		output: number;
		cacheRead: number;
		cacheWrite: number;
		totalTokens: number;
		costUsd?: number;
	};
}

export interface RoutingDispatchRow {
	id: string;
	sessionId: string | null;
	parentAgentId: string | null;
	agent: string;
	role: string | null;
	provider: string;
	modelId: string;
	selector: string;
	effort: string | null;
	pinned: boolean;
	confidence: RoutingConfidence;
	reason: string;
	startedAt: number;
	endedAt: number | null;
	outcome: RoutingDispatchOutcome | null;
	finalSelector: string | null;
	modelChanged: boolean;
	totalTokens: number | null;
}

export interface RoutingCostEstimate {
	fraction: number;
	source: "observed" | "default";
}

/** Read view offered inside one ledger transaction; every count is consistent with the reservation that follows. */
export interface RoutingLedgerView {
	inflight(provider: string): number;
	recentDispatches(provider: string, now: number): number;
	estimateDispatchCost(provider: string, credentialId: number | undefined, defaultFraction: number): RoutingCostEstimate;
	reserve(reservation: RoutingReservation): void;
}

interface DispatchDbRow {
	id: string;
	session_id: string | null;
	parent_agent_id: string | null;
	agent: string;
	role: string | null;
	provider: string;
	model_id: string;
	selector: string;
	effort: string | null;
	pinned: number;
	confidence: string;
	reason: string;
	started_at: number;
	ended_at: number | null;
	outcome: string | null;
	final_selector: string | null;
	model_changed: number | null;
	total_tokens: number | null;
}

interface SnapshotDbRow {
	fetched_at: number;
	remaining_fraction: number;
	resets_at: number | null;
}

/** `provider/model` with any thinking suffix dropped, so a resolved `:medium` is not a model change. */
function baseModel(selector: string): string {
	const routing = splitUpstreamRouting(selector);
	const thinking = splitThinkingSuffix(routing?.base ?? selector);
	return `${thinking.base}${routing ? `@${routing.upstream}` : ""}`;
}

function processAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === "EPERM";
	}
}

function toRow(row: DispatchDbRow): RoutingDispatchRow {
	return {
		id: row.id,
		sessionId: row.session_id,
		parentAgentId: row.parent_agent_id,
		agent: row.agent,
		role: row.role,
		provider: row.provider,
		modelId: row.model_id,
		selector: row.selector,
		effort: row.effort,
		pinned: row.pinned === 1,
		confidence: row.confidence === "low" ? "low" : "high",
		reason: row.reason,
		startedAt: row.started_at,
		endedAt: row.ended_at,
		outcome: row.outcome as RoutingDispatchOutcome | null,
		finalSelector: row.final_selector,
		modelChanged: row.model_changed === 1,
		totalTokens: row.total_tokens,
	};
}

export class RoutingStore {
	readonly #db: Database;
	readonly #host = os.hostname();

	private constructor(db: Database) {
		this.#db = db;
	}

	static async open(dbPath: string) {
		fs.mkdirSync(path.dirname(dbPath), { recursive: true });
		return openSqliteDatabase(
			dbPath,
			db => {
				db.run("PRAGMA journal_mode=WAL");
				db.run("PRAGMA synchronous=NORMAL");
				const version = db.query<{ user_version: number }, []>("PRAGMA user_version").get()?.user_version ?? 0;
				if (version !== 0 && version !== SCHEMA_VERSION) {
					db.run("DROP TABLE IF EXISTS dispatches; DROP TABLE IF EXISTS usage_snapshots;");
				}
				db.run(SCHEMA_SQL);
				db.run(`PRAGMA user_version = ${SCHEMA_VERSION}`);
				return new RoutingStore(db);
			},
			{ recoverCorruption: true },
		);
	}

	/**
	 * Run `fn` inside one write transaction. Orphans are swept first so the
	 * counts `fn` reads never include a dead process's reservation, and the
	 * reservation `fn` inserts commits atomically with those reads.
	 */
	transact<T>(now: number, fn: (view: RoutingLedgerView) => T): T {
		const run = this.#db.transaction(() => {
			this.#sweepOrphans(now);
			return fn(this.#view());
		});
		return run.immediate();
	}

	#view(): RoutingLedgerView {
		const inflightQuery = this.#db.query<{ count: number }, [string]>(
			"SELECT COUNT(*) AS count FROM dispatches WHERE provider = ? AND ended_at IS NULL",
		);
		const recentQuery = this.#db.query<{ count: number }, [string, number]>(
			"SELECT COUNT(*) AS count FROM dispatches WHERE provider = ? AND started_at >= ?",
		);
		const insert = this.#db.query(
			`INSERT INTO dispatches (
				id, session_id, parent_agent_id, pid, host, agent, role, provider, model_id, selector, effort, pinned,
				policy_version, confidence, reason, candidates_json, cost_estimate_source, started_at
			) VALUES (
				$id, $sessionId, $parentAgentId, $pid, $host, $agent, $role, $provider, $modelId, $selector, $effort, $pinned,
				$policyVersion, $confidence, $reason, $candidatesJson, $costEstimateSource, $startedAt
			)`,
		);
		return {
			inflight: provider => inflightQuery.get(provider)?.count ?? 0,
			recentDispatches: (provider, now) => recentQuery.get(provider, now - RECENT_DISPATCH_WINDOW_MS)?.count ?? 0,
			estimateDispatchCost: (provider, credentialId, defaultFraction) =>
				this.#estimateDispatchCost(provider, credentialId, defaultFraction),
			reserve: reservation => {
				insert.run({
					$id: reservation.id,
					$sessionId: reservation.sessionId ?? null,
					$parentAgentId: reservation.parentAgentId ?? null,
					$pid: process.pid,
					$host: this.#host,
					$agent: reservation.agent,
					$role: reservation.role ?? null,
					$provider: reservation.provider,
					$modelId: reservation.modelId,
					$selector: reservation.selector,
					$effort: reservation.effort ?? null,
					$pinned: reservation.pinned ? 1 : 0,
					$policyVersion: reservation.policyVersion,
					$confidence: reservation.confidence,
					$reason: reservation.reason,
					$candidatesJson: JSON.stringify(reservation.assessments),
					$costEstimateSource: reservation.costEstimateSource,
					$startedAt: reservation.startedAt,
				});
			},
		};
	}

	#sweepOrphans(now: number): void {
		const open = this.#db
			.query<{ id: string; pid: number; started_at: number }, []>(
				"SELECT id, pid, started_at FROM dispatches WHERE ended_at IS NULL",
			)
			.all();
		const release = this.#db.query<unknown, [number, string]>(
			"UPDATE dispatches SET ended_at = ?, outcome = 'orphaned' WHERE id = ? AND ended_at IS NULL",
		);
		for (const row of open) {
			const dead = !processAlive(row.pid);
			const expired = now - row.started_at > ORPHAN_AFTER_MS;
			if (dead || expired) release.run(now, row.id);
		}
	}

	/** Release a reservation. Idempotent: a second completion for the same id changes nothing. */
	complete(id: string, completion: RoutingCompletion): boolean {
		const existing = this.#db
			.query<{ selector: string }, [string]>("SELECT selector FROM dispatches WHERE id = ? AND ended_at IS NULL")
			.get(id);
		if (!existing) return false;
		const finalSelector = completion.finalSelector ?? existing.selector;
		this.#db
			.query(
				`UPDATE dispatches SET
					ended_at = $endedAt, outcome = $outcome, final_selector = $finalSelector, model_changed = $modelChanged,
					retries = $retries, input_tokens = $input, output_tokens = $output, cache_read_tokens = $cacheRead,
					cache_write_tokens = $cacheWrite, total_tokens = $totalTokens, cost_usd = $costUsd
				WHERE id = $id AND ended_at IS NULL`,
			)
			.run({
				$id: id,
				$endedAt: completion.endedAt,
				$outcome: completion.outcome,
				$finalSelector: finalSelector,
				$modelChanged: baseModel(finalSelector) === baseModel(existing.selector) ? 0 : 1,
				$retries: completion.retries ?? null,
				$input: completion.usage?.input ?? null,
				$output: completion.usage?.output ?? null,
				$cacheRead: completion.usage?.cacheRead ?? null,
				$cacheWrite: completion.usage?.cacheWrite ?? null,
				$totalTokens: completion.usage?.totalTokens ?? null,
				$costUsd: completion.usage?.costUsd ?? null,
			});
		return true;
	}

	/** Record one credential's quota windows once per distinct report fetch. */
	recordSnapshot(
		provider: string,
		credentialId: number,
		fetchedAt: number,
		windows: readonly RoutingWindowSnapshot[],
	): void {
		const insert = this.#db.query(
			`INSERT OR IGNORE INTO usage_snapshots (
				provider, credential_id, window_id, fetched_at, remaining_fraction, resets_at, duration_ms
			) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		);
		for (const window of windows) {
			insert.run(
				provider,
				credentialId,
				window.id,
				fetchedAt,
				window.remainingFraction,
				window.resetsAt ?? null,
				window.durationMs ?? null,
			);
		}
	}

	/**
	 * Allowance fraction one dispatch on `provider` is expected to consume,
	 * derived from one credential's two most recent reports for its shortest
	 * window and the tokens dispatched through this ledger in between.
	 */
	#estimateDispatchCost(
		provider: string,
		credentialId: number | undefined,
		defaultFraction: number,
	): RoutingCostEstimate {
		const fallback: RoutingCostEstimate = { fraction: Math.max(0, defaultFraction), source: "default" };
		if (credentialId === undefined) return fallback;
		const window = this.#db
			.query<{ window_id: string }, [string, number]>(
				`SELECT window_id FROM usage_snapshots WHERE provider = ? AND credential_id = ?
				 ORDER BY duration_ms IS NULL, duration_ms ASC, fetched_at DESC LIMIT 1`,
			)
			.get(provider, credentialId);
		if (!window) return fallback;
		const snapshots = this.#db
			.query<SnapshotDbRow, [string, number, string]>(
				`SELECT fetched_at, remaining_fraction, resets_at FROM usage_snapshots
				 WHERE provider = ? AND credential_id = ? AND window_id = ? ORDER BY fetched_at DESC LIMIT 2`,
			)
			.all(provider, credentialId, window.window_id);
		if (snapshots.length < 2) return fallback;
		const [current, previous] = snapshots as [SnapshotDbRow, SnapshotDbRow];
		if (current.resets_at !== previous.resets_at) return fallback;
		const drain = previous.remaining_fraction - current.remaining_fraction;
		if (drain <= 0) return fallback;
		const tokens =
			this.#db
				.query<{ tokens: number | null }, [string, number, number]>(
					`SELECT SUM(total_tokens) AS tokens FROM dispatches
					 WHERE provider = ? AND ended_at > ? AND ended_at <= ? AND total_tokens IS NOT NULL`,
				)
				.get(provider, previous.fetched_at, current.fetched_at)?.tokens ?? 0;
		if (tokens <= 0) return fallback;
		const perToken = drain / tokens;
		const recentTokens = this.#db
			.query<{ total_tokens: number }, [string, number]>(
				`SELECT total_tokens FROM dispatches WHERE provider = ? AND total_tokens IS NOT NULL
				 ORDER BY ended_at DESC LIMIT ?`,
			)
			.all(provider, OBSERVED_SAMPLE_SIZE)
			.map(row => row.total_tokens)
			.sort((a, b) => a - b);
		if (recentTokens.length === 0) return fallback;
		const median = recentTokens[Math.floor(recentTokens.length / 2)]!;
		return { fraction: Math.min(MAX_ESTIMATED_COST_FRACTION, perToken * median), source: "observed" };
	}

	/** Most recent decisions, newest first. */
	recentDecisions(limit: number): RoutingDispatchRow[] {
		return this.#db
			.query<DispatchDbRow, [number]>(
				`SELECT id, session_id, parent_agent_id, agent, role, provider, model_id, selector, effort, pinned, confidence,
				 reason, started_at, ended_at, outcome, final_selector, model_changed, total_tokens
				 FROM dispatches ORDER BY started_at DESC LIMIT ?`,
			)
			.all(limit)
			.map(toRow);
	}

	/** Every reservation not yet released, oldest first. */
	openDispatches(): RoutingDispatchRow[] {
		return this.#db
			.query<DispatchDbRow, []>(
				`SELECT id, session_id, parent_agent_id, agent, role, provider, model_id, selector, effort, pinned, confidence,
				 reason, started_at, ended_at, outcome, final_selector, model_changed, total_tokens
				 FROM dispatches WHERE ended_at IS NULL ORDER BY started_at ASC`,
			)
			.all()
			.map(toRow);
	}

	close(): void {
		this.#db.close();
	}
}
