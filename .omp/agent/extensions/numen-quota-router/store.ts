// generated-by: numen-sync
/** Persistent audit log for quota-aware subagent routing decisions. */
import type { Database } from "bun:sqlite";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { openSqliteDatabase } from "@oh-my-pi/pi-utils";
import type { RoutingCandidateAssessment, RoutingConfidence } from "./policy";

const SCHEMA_VERSION = 2;
const RECENT_DISPATCH_WINDOW_MS = 5 * 60 * 60 * 1000;

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

export type RoutingDispatchOutcome = "routed" | "completed" | "failed" | "aborted" | "orphaned";

export interface RoutingDecisionRecord {
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
	startedAt: number;
}

export interface RoutingDispatchRow {
	id: string;
	agent: string;
	role: string | null;
	selector: string;
	pinned: boolean;
	confidence: RoutingConfidence;
	reason: string;
	startedAt: number;
	endedAt: number | null;
	outcome: RoutingDispatchOutcome | null;
	finalSelector: string | null;
}

/** Write view offered inside one transaction so fairness and its audit row share a consistent snapshot. */
export interface RoutingLedgerView {
	recentDispatches(provider: string, now: number): number;
	recordDecision(decision: RoutingDecisionRecord): void;
}

interface DispatchDbRow {
	id: string;
	agent: string;
	role: string | null;
	selector: string;
	pinned: number;
	confidence: string;
	reason: string;
	started_at: number;
	ended_at: number | null;
	outcome: string | null;
	final_selector: string | null;
}

function toRow(row: DispatchDbRow): RoutingDispatchRow {
	return {
		id: row.id,
		agent: row.agent,
		role: row.role,
		selector: row.selector,
		pinned: row.pinned === 1,
		confidence: row.confidence === "low" ? "low" : "high",
		reason: row.reason,
		startedAt: row.started_at,
		endedAt: row.ended_at,
		outcome: row.outcome as RoutingDispatchOutcome | null,
		finalSelector: row.final_selector,
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

	/** Run `fn` inside one write transaction. */
	transact<T>(fn: (view: RoutingLedgerView) => T): T {
		const run = this.#db.transaction(() => fn(this.#view()));
		return run.immediate();
	}

	#view(): RoutingLedgerView {
		const recentQuery = this.#db.query<{ count: number }, [string, number]>(
			"SELECT COUNT(*) AS count FROM dispatches WHERE provider = ? AND started_at >= ?",
		);
		const insert = this.#db.query(
			`INSERT INTO dispatches (
				id, session_id, parent_agent_id, pid, host, agent, role, provider, model_id, selector, effort, pinned,
				policy_version, confidence, reason, candidates_json, cost_estimate_source, started_at,
				ended_at, outcome, final_selector, model_changed
			) VALUES (
				$id, $sessionId, $parentAgentId, $pid, $host, $agent, $role, $provider, $modelId, $selector, $effort, $pinned,
				$policyVersion, $confidence, $reason, $candidatesJson, 'dispatch', $startedAt,
				$startedAt, 'routed', $selector, 0
			)`,
		);
		return {
			recentDispatches: (provider, now) => recentQuery.get(provider, now - RECENT_DISPATCH_WINDOW_MS)?.count ?? 0,
			recordDecision: decision => {
				insert.run({
					$id: decision.id,
					$sessionId: decision.sessionId ?? null,
					$parentAgentId: decision.parentAgentId ?? null,
					$pid: process.pid,
					$host: this.#host,
					$agent: decision.agent,
					$role: decision.role ?? null,
					$provider: decision.provider,
					$modelId: decision.modelId,
					$selector: decision.selector,
					$effort: decision.effort ?? null,
					$pinned: decision.pinned ? 1 : 0,
					$policyVersion: decision.policyVersion,
					$confidence: decision.confidence,
					$reason: decision.reason,
					$candidatesJson: JSON.stringify(decision.assessments),
					$startedAt: decision.startedAt,
				});
			},
		};
	}

	/** Most recent decisions, newest first. */
	recentDecisions(limit: number): RoutingDispatchRow[] {
		return this.#db
			.query<DispatchDbRow, [number]>(
				`SELECT id, agent, role, selector, pinned, confidence, reason, started_at,
				 ended_at, outcome, final_selector
				 FROM dispatches ORDER BY started_at DESC LIMIT ?`,
			)
			.all(limit)
			.map(toRow);
	}

	close(): void {
		this.#db.close();
	}
}
