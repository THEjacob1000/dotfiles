import { spawn } from "node:child_process";
import type { CommandConfig } from "./recall";

const MAX_REQUEST = 256 * 1024;
const MAX_RESPONSE = 1024;
const TIMEOUT_MS = 2500;

export function capture(command: CommandConfig, itemId: string, content: string, ttlSeconds: number, signal: AbortSignal): Promise<void> {
	if (signal.aborted) return Promise.reject(new Error("capture aborted"));
	const now = Date.now();
	const request = Buffer.from(`${JSON.stringify({ version: 1, source: "omp", item_id: itemId,
		observed_at: new Date(now).toISOString(), expires_at: new Date(now + ttlSeconds * 1000).toISOString(), content })}\n`);
	if (Buffer.byteLength(content) > 64 * 1024 || request.length > MAX_REQUEST) return Promise.reject(new Error("capture too large"));
	const { promise, resolve, reject } = Promise.withResolvers<void>();
	const child = spawn(command.command, command.args, { stdio: ["pipe", "pipe", "ignore"] });
	let complete = false;
	let response = Buffer.alloc(0);
	let escalation: NodeJS.Timeout | undefined;
	const finish = (error?: Error, terminate = true) => {
		if (complete) return;
		complete = true;
		clearTimeout(timer);
		signal.removeEventListener("abort", onAbort);
		if (terminate) {
			child.kill("SIGTERM");
			escalation = setTimeout(() => child.kill("SIGKILL"), 200);
			escalation.unref();
		}
		if (error) reject(error);
		else resolve();
	};
	const onAbort = () => finish(new Error("capture aborted"));
	const timer = setTimeout(() => finish(new Error("capture timeout")), TIMEOUT_MS);
	signal.addEventListener("abort", onAbort, { once: true });
	child.on("error", () => finish(new Error("capture unavailable")));
	child.stdin.on("error", () => finish(new Error("capture transport closed")));
	child.stdout.on("data", (chunk: Buffer) => {
		if (complete) return;
		if (response.length + chunk.length > MAX_RESPONSE) return finish(new Error("capture response too large"));
		response = Buffer.concat([response, chunk]);
	});
	child.on("close", code => {
		clearTimeout(escalation);
		if (complete) return;
		if (code !== 0 || response.length < 2 || response[response.length - 1] !== 10 || response.subarray(0, -1).includes(10)) {
			return finish(new Error("capture transport closed"), false);
		}
		let value: unknown;
		try {
			value = JSON.parse(response.subarray(0, -1).toString("utf8"));
		} catch {
			return finish(new Error("capture rejected"), false);
		}
		if (!value || typeof value !== "object" || !("ok" in value)) return finish(new Error("capture rejected"), false);
		if (value.ok === false && "error" in value) {
			if (value.error === "QUEUE_FULL") return finish(new Error("queue full"), false);
			if (value.error === "QUEUE_BUSY") return finish(new Error("queue busy"), false);
			return finish(new Error("capture rejected"), false);
		}
		if (value.ok !== true || !("status" in value) || (value.status !== "queued" && value.status !== "duplicate")) return finish(new Error("capture rejected"), false);
		finish(undefined, false);
	});
	child.stdin.end(request);
	if (signal.aborted) onAbort();
	return promise;
}
