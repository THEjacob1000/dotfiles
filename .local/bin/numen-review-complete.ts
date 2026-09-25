import { completeSimple } from "@oh-my-pi/pi-ai";
import { Flag, classify, classifyMessage, is } from "@oh-my-pi/pi-ai/error";
import { ModelRegistry, Settings, discoverAuthStorage } from "@oh-my-pi/pi-coding-agent";

export interface CompletionArgs {
	modelId: string;
	maxTokens: number;
}

type ErrorCode = "args" | "auth" | "transport";

class CompletionError extends Error {
	constructor(readonly code: ErrorCode, message: string, readonly assistantMessage?: object) {
		super(message);
	}
}

interface Dependencies {
	complete(args: CompletionArgs, prompt: string): Promise<string>;
}

interface RunResult {
	code: number;
	stdout?: string;
	stderr?: string;
}

const USAGE = "usage: numen-review-complete <model-id> <max-output-tokens>";

export function parseArgs(args: string[]): CompletionArgs {
	if (args.length !== 2) throw new Error(USAGE);
	const [modelId, tokenText] = args;
	if (!modelId?.trim()) throw new Error("model id is required");
	const slash = modelId.indexOf("/");
	if (slash <= 0 || slash === modelId.length - 1) throw new Error("model id must be provider-qualified");
	if (!/^[1-9]\d*$/.test(tokenText ?? "")) throw new Error("tokens must be a positive integer");
	const maxTokens = Number(tokenText);
	if (!Number.isSafeInteger(maxTokens)) throw new Error("tokens must be a safe integer");
	return { modelId, maxTokens };
}

async function complete({ modelId, maxTokens }: CompletionArgs, prompt: string): Promise<string> {
	const slash = modelId.indexOf("/");
	const provider = modelId.slice(0, slash);
	const id = modelId.slice(slash + 1);
	const registrySettings = await Settings.init({ cwd: process.cwd() });
	const authStorage = await discoverAuthStorage(undefined, { settings: registrySettings, cwd: process.cwd() });
	try {
		const registry = new ModelRegistry(authStorage, undefined, { settings: registrySettings });
		await registry.hydrateCredentialScopedModelCaches();
		const model = registry.find(provider, id);
		if (!model) throw new CompletionError("args", "model not found");
		if (await registry.getApiKey(model) === undefined) throw new CompletionError("auth", "credential not found");
		const message = await completeSimple(
			model,
			{ messages: [{ role: "user", content: prompt }] },
			{ apiKey: registry.resolver(model), maxTokens },
		);
		if (message.stopReason === "error" || message.stopReason === "aborted") {
			const id = classifyMessage(message);
			throw new CompletionError(
				is(id, Flag.AuthFailed) ? "auth" : "transport",
				message.errorMessage ?? "completion failed",
			);
		}
		return message.content
			.filter((part): part is Extract<(typeof message.content)[number], { type: "text" }> => part.type === "text")
			.map(part => part.text)
			.join("");
	} finally {
		authStorage.close();
	}
}

function errorCode(error: unknown): ErrorCode {
	if (error instanceof CompletionError) return error.code;
	return is(classify(error), Flag.AuthFailed) ? "auth" : "transport";
}

export async function run(args: string[], prompt: string, dependencies: Dependencies = { complete }): Promise<RunResult> {
	let parsed: CompletionArgs;
	try {
		parsed = parseArgs(args);
	} catch {
		return { code: 2, stderr: "args\n" };
	}
	if (!prompt.trim()) return { code: 2, stderr: "prompt\n" };
	try {
		return { code: 0, stdout: await dependencies.complete(parsed, prompt) };
	} catch (error) {
		return { code: 1, stderr: `${errorCode(error)}\n` };
	}
}

if (import.meta.main) {
	const result = await run(Bun.argv.slice(2), await Bun.stdin.text());
	if (result.stdout !== undefined) await Bun.write(Bun.stdout, result.stdout);
	if (result.stderr !== undefined) await Bun.write(Bun.stderr, result.stderr);
	// Provider SDK sockets and timers keep the loop alive after the one completion.
	process.exit(result.code);
}
