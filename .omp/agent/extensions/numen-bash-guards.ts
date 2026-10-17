// generated-by: numen-sync
import { statSync } from "node:fs";
import {
	isToolCallEventType,
	type ExtensionAPI,
	type ToolCallEventResult,
} from "@oh-my-pi/pi-coding-agent";
import { resolveToCwd } from "@oh-my-pi/pi-coding-agent/tools/path-utils";
import { lexShellCommand, tokenizeShellSegments } from "@oh-my-pi/pi-coding-agent/tools/shell-tokenize";

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

function sedRead(args: string[]): { paths: string[]; range: string } | undefined {
	const match = args[0] === "-n" && /^([1-9]\d*)(?:,([1-9]\d*))?p$/.exec(args[1] ?? "");
	if (!match || Number(match[2] ?? match[1]) < Number(match[1]) || args.length !== 3) return;
	return { paths: args.slice(2), range: `:${match[1]}-${match[2] ?? match[1]}` };
}

function edgeRead(binary: string, args: string[]): { paths: string[]; range: string } {
	let count = "10";
	if (args[0] === "-n" && /^[1-9]\d*$/.test(args[1] ?? "")) {
		count = args[1];
		args = args.slice(2);
	} else if (/^-[1-9]\d*$/.test(args[0] ?? "")) {
		count = args[0].slice(1);
		args = args.slice(1);
	}
	return { paths: args, range: binary === "head" ? `:1-${count}` : `:-${count}` };
}

function readReplacement(binary: string, args: string[]): string | undefined {
	let selection = { paths: args, range: "" };
	if (binary === "sed") {
		const parsed = sedRead(args);
		if (!parsed) return;
		selection = parsed;
	} else if (binary === "head" || binary === "tail") selection = edgeRead(binary, args);
	const { paths, range } = selection;
	if (!paths.length || paths.some(path => path.startsWith("-") || path.includes(":"))) return;
	return paths.map(path => `read ${JSON.stringify({ path: path + range })}`).join("\n");
}

function searchArguments(binary: string, args: string[]): { pattern: string; paths: string[]; insensitive: boolean; extended: boolean } | undefined {
	let pattern: string | undefined;
	let insensitive = false;
	let extended = binary === "rg";
	const paths: string[] = [];
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if ((binary === "rg" ? /^-[ni]+$/ : /^-[niErR]+$/).test(arg)) {
			insensitive ||= arg.includes("i");
			extended ||= arg.includes("E");
		} else if (arg === "-e" && pattern === undefined && args[i + 1]) {
			pattern = args[++i];
		} else if (arg.startsWith("-")) return;
		else if (pattern === undefined) pattern = arg;
		else paths.push(arg);
	}
	if (pattern === undefined) return;
	return { pattern, paths, insensitive, extended };
}

function searchReplacement(binary: string, args: string[]): string | undefined {
	const parsed = searchArguments(binary, args);
	if (!parsed) return;
	const { pattern, paths, insensitive, extended } = parsed;
	if (binary === "grep" && !paths.length) return;
	if (!extended && /[(){}|+?]/.test(pattern)) return;
	return `grep ${JSON.stringify({ pattern, path: paths.join(";") || ".", case: !insensitive, gitignore: binary === "rg" })}`;
}

function isDirectory(path: string, cwd: string): boolean {
	try {
		return statSync(resolveToCwd(path, cwd)).isDirectory();
	} catch {
		// Missing or inaccessible paths are not known plain directory retrievals.
		return false;
	}
}

function listingReplacement(args: string[], cwd: string): string | undefined {
	const paths = args.filter(arg => arg !== "-1");
	if (paths.some(arg => arg.startsWith("-"))) return;
	const roots = paths.length ? paths : ["."];
	if (roots.some(path => !isDirectory(path, cwd))) return;
	return `glob ${JSON.stringify({ path: roots.map(path => `${path.replace(/\/+$/, "")}/*`).join(";"), hidden: false, gitignore: false })}`;
}

function fdReplacement(args: string[]): string | undefined {
	if (args.length > 2 || !/^[a-z0-9_-]*$/.test(args[0] ?? "") || args.some(arg => arg.startsWith("-"))) return;
	const pattern = (args[0] ?? "").replace(/[a-z]/g, char => `[${char}${char.toUpperCase()}]`);
	return `glob ${JSON.stringify({ path: `${args[1] ?? "."}/**/*${pattern}*`, hidden: false })}`;
}

function findArguments(args: string[]): { paths: string[]; name: string; type: string } | undefined {
	if (args.filter(arg => arg === "-name").length > 1 || args.filter(arg => arg === "-type").length > 1) return;
	const paths: string[] = [];
	let name = "*";
	let type = "";
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "-name" && args[i + 1]) name = args[++i];
		else if (arg === "-type" && /^[fd]$/.test(args[i + 1] ?? "")) type = args[++i];
		else if (arg !== "-print") {
			if (arg.startsWith("-") || arg === "!" || arg === "(" || arg === ")") return;
			paths.push(arg);
		}
	}
	return { paths, name, type };
}

function discoveryReplacement(binary: string, args: string[], cwd: string): string | undefined {
	if (binary === "ls") return listingReplacement(args, cwd);
	if (binary === "fd") return fdReplacement(args);
	const parsed = findArguments(args);
	if (!parsed) return;
	const { paths, name, type } = parsed;
	const roots = paths.length ? paths : ["."];
	if (roots.some(path => !isDirectory(path, cwd))) return;
	return `glob ${JSON.stringify({ path: roots.map(path => `${path.replace(/\/+$/, "")}/**/${name}`).join(";"), hidden: true, gitignore: false })}${type ? `; keep ${type === "f" ? "file" : "directory"} entries` : ""}`;
}

function literalRetrievalSegments(command: string): string[][] | undefined {
	// Only literal pipelines qualify: leave shell effects and ambiguous syntax alone.
	if (hasDynamicShell(command) || /[<>`$\\\n]/.test(command)) return;
	const tokens = lexShellCommand(command.trim());
	if (tokens.some(token => token.kind === "separator" && !/^[ \t]*(?:\|[ \t]*)?$/.test(token.raw))) return;
	if (tokens.some(token => token.kind === "word" && (!token.value || token.raw.startsWith("#")))) return;
	if (tokens.some(token => token.kind === "word" && /[*?[\]{}~]/.test(token.raw.replace(/'[^']*'|"[^"]*"/g, "")))) return;
	if (tokens[0]?.kind !== "word" || tokens.at(-1)?.kind !== "word") return;
	return tokenizeShellSegments(command);
}

function retrievalCommand(segments: string[][]): string[] | undefined {
	if (!segments.length) return;
	let [binary, ...args] = segments[0];
	if (segments.length === 2 && binary === "cat" && args.length === 1 && !args[0].startsWith("-")) {
		const [filter, ...filterArgs] = segments[1];
		if (!["head", "tail", "sed"].includes(filter)) return;
		if (filterArgs.length && !(filterArgs.length === 1 && /^-[1-9]\d*$/.test(filterArgs[0])) &&
			!(filterArgs.length === 2 && (filterArgs[0] === "-n"))) return;
		binary = filter;
		args = [...filterArgs, ...args];
	} else if (segments.length !== 1) return;
	return [binary, ...args];
}

function retrievalReplacement(command: string, cwd: string): string | undefined {
	const segments = literalRetrievalSegments(command);
	if (!segments) return;
	const parsed = retrievalCommand(segments);
	if (!parsed) return;
	const [binary, ...args] = parsed;
	if (args.some(arg => arg === "--help" || arg === "--version")) return;
	let replacement: string | undefined;
	if (["cat", "head", "tail", "sed"].includes(binary)) replacement = readReplacement(binary, args);
	else if (binary === "grep" || binary === "rg") replacement = searchReplacement(binary, args);
	else if (["ls", "find", "fd"].includes(binary)) replacement = discoveryReplacement(binary, args, cwd);
	if (replacement) return `Plain shell retrieval is blocked. Use OMP's structured tools instead:\n${replacement}`;
}

export default function numenBashGuards(pi: ExtensionAPI): void {
	pi.on("tool_call", async (event, ctx): Promise<ToolCallEventResult | undefined> => {
		if (!isToolCallEventType("bash", event)) return;
		const cwd = resolveToCwd(event.input.cwd ?? ".", ctx.cwd);
		const replacement = retrievalReplacement(event.input.command, cwd);
		if (replacement) return {
			block: true,
			reason: `${replacement}\nResolve relative paths from ${cwd}.`,
		};
		const guards = matchingGuards(event.input.command);
		if (!guards.length) return;
		const input = new Blob([JSON.stringify({ tool_input: { command: event.input.command } })]);
		const reasons = await Promise.all(guards.map(async guard => {
			const recovery = guard === "voice-lint"
				? "Restore voice-lint on PATH and fix any hook failure before publishing."
				: "Restore pr-template-check on PATH; PR_TEMPLATE_CHECK=off is the script's escape hatch once it can run.";
			try {
				const cwd = event.input.cwd ? resolveToCwd(event.input.cwd, ctx.cwd) : ctx.cwd;
				const run = Bun.spawn([guard, "--hook"], {
					cwd, env: process.env, stdin: input, stdout: "ignore", stderr: "pipe",
					// Leave room for the result inside OMP's 30s tool_call deadline.
					timeout: 25_000,
				});
				const [exit, stderr] = await Promise.all([run.exited, new Response(run.stderr).text()]);
				if (run.signalCode !== null) {
					return `${guard} --hook did not finish (${run.signalCode}). ${recovery}`;
				}
				if (exit === 2) return stderr.trim() || `${guard} --hook blocked the call (exit 2).`;
				if (exit !== 0) {
					const failure = `${guard} --hook exited ${exit} (non-blocking): ${stderr.trim() || "no stderr"}`;
					pi.sendMessage({ customType: "numen-bash-guards", content: failure, display: true }, { deliverAs: "nextTurn" });
				}
				return undefined;
			} catch (error) {
				return `${guard} --hook could not run: ${error instanceof Error ? error.message : String(error)}. ${recovery}`;
			}
		}));
		const blocked = reasons.filter((reason): reason is string => reason !== undefined);
		return blocked.length ? { block: true, reason: blocked.join("\n\n") } : undefined;
	});
}
