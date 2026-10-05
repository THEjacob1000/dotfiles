// generated-by: numen-sync
import {
	isToolCallEventType,
	type ExtensionAPI,
	type ToolCallEventResult,
} from "@oh-my-pi/pi-coding-agent";
import { resolveToCwd } from "@oh-my-pi/pi-coding-agent/tools/path-utils";
import { tokenizeShellSegments } from "@oh-my-pi/pi-coding-agent/tools/shell-tokenize";

type Guard = "voice-lint" | "pr-template-check";

function hasDynamicShell(command: string): boolean {
	let single = false;
	let double = false;
	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		if (char === "'" && !double) { single = !single; continue; }
		if (single) continue;
		if (char === "\\") { i++; continue; }
		if (char === '"') { double = !double; continue; }
		if (char === "`" || (char === "$" && /[({A-Za-z_0-9]/.test(command[i + 1] ?? ""))) return true;
	}
	return single || double;
}

function matchingInput(command: string): string {
	// Heredoc bodies are arguments, not subcommands; unquoted bodies can expand.
	const withoutBodies = command.replace(
		/(<<-?[ \t]*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\2[^\n]*\n)([\s\S]*?)^\t*\3[ \t]*(?:\n|$)/gm,
		(_match, header: string, quote: string, _delimiter: string, body: string) =>
			header + (!quote && hasDynamicShell(body) ? "$HEREDOC_EXPANSION\n" : ""),
	);
	let single = false;
	let double = false;
	let result = "";
	for (let i = 0; i < withoutBodies.length; i++) {
		const char = withoutBodies[i];
		if (char === "'" && !double) single = !single;
		if (char === '"' && !single) double = !double;
		if (!single && char === "\\") {
			if (withoutBodies[i + 1] !== "\n") result += char + (withoutBodies[i + 1] ?? "");
			i++;
			continue;
		}
		if (!single && !double && char === "#" && (i === 0 || /[\s;&|()]/.test(withoutBodies[i - 1]))) {
			while (i < withoutBodies.length && withoutBodies[i] !== "\n") i++;
			result += "\n";
			continue;
		}
		result += char;
	}
	return result;
}

function matchingGuards(command: string): Guard[] {
	// Claude's Bash(...) filters check subcommands and strip leading assignments.
	// Dynamic shell forms fall through to the scripts, which inspect the full input.
	command = matchingInput(command);
	if (hasDynamicShell(command)) return ["voice-lint", "pr-template-check"];
	let voice = false;
	let template = false;
	for (const segment of tokenizeShellSegments(command)) {
		let start = 0;
		while (/^(?:if|then|elif|else|do|!|[A-Za-z_][A-Za-z0-9_]*\+?=.*)$/.test(segment[start] ?? "")) start++;
		const [binary, subcommand, action] = segment.slice(start);
		if (binary === "gh") {
			voice = true;
			if (subcommand === "pr" && (action === "create" || action === "edit")) template = true;
		}
		if ((binary === "jj" && (subcommand === "describe" || subcommand === "commit")) ||
			(binary === "git" && subcommand === "commit")) voice = true;
	}
	const guards: Guard[] = [];
	if (voice) guards.push("voice-lint");
	if (template) guards.push("pr-template-check");
	return guards;
}

export default function numenBashGuards(pi: ExtensionAPI): void {
	pi.on("tool_call", async (event, ctx): Promise<ToolCallEventResult | undefined> => {
		if (!isToolCallEventType("bash", event)) return;
		const guards = matchingGuards(event.input.command);
		if (!guards.length) return;
		const input = new Blob([JSON.stringify({ tool_input: { command: event.input.command } })]);
		const reasons = await Promise.all(guards.map(async guard => {
			const escape = guard === "voice-lint" ? "VOICE_LINT=off" : "PR_TEMPLATE_CHECK=off";
			try {
				const cwd = event.input.cwd ? resolveToCwd(event.input.cwd, ctx.cwd) : ctx.cwd;
				const run = Bun.spawn([guard, "--hook"], {
					cwd, env: process.env, stdin: input, stdout: "ignore", stderr: "pipe",
					// Leave room for the result inside OMP's 30s tool_call deadline.
					timeout: 25_000,
				});
				const [exit, stderr] = await Promise.all([run.exited, new Response(run.stderr).text()]);
				if (run.signalCode !== null) {
					return `${guard} --hook did not finish (${run.signalCode}). Restore the hook; ${escape} is its escape hatch.`;
				}
				if (exit === 2) return stderr.trim() || `${guard} --hook blocked the call (exit 2).`;
				if (exit !== 0) {
					const failure = `${guard} --hook exited ${exit} (non-blocking): ${stderr.trim() || "no stderr"}`;
					pi.sendMessage({ customType: "numen-bash-guards", content: failure, display: true }, { deliverAs: "nextTurn" });
				}
				return undefined;
			} catch (error) {
				return `${guard} --hook could not run: ${error instanceof Error ? error.message : String(error)}. Restore ${guard} on PATH; ${escape} is the script's escape hatch once it can run.`;
			}
		}));
		const blocked = reasons.filter((reason): reason is string => reason !== undefined);
		return blocked.length ? { block: true, reason: blocked.join("\n\n") } : undefined;
	});
}
