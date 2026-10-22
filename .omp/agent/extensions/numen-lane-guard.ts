// generated-by: numen-sync
import { existsSync, lstatSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type { ExtensionAPI, ToolCallEventResult } from "@oh-my-pi/pi-coding-agent";
import { resolveToCwd } from "@oh-my-pi/pi-coding-agent/tools/path-utils";
import { unwrapHashlineHeaderPath } from "@oh-my-pi/pi-coding-agent/tools/plan-mode-guard";
import { editInspect } from "@oh-my-pi/pi-natives";

function canonical(path: string): string {
	try {
		return realpathSync(path);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
		if (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error(`Unresolvable symlink: ${path}`);
		const parent = dirname(path);
		if (parent === path) throw error;
		return resolve(canonical(parent), relative(parent, path));
	}
}

function editPaths(input: Record<string, unknown>, cwd: string): string[] {
	const paths = new Set<string>();
	const args = JSON.stringify(input);
	for (const mode of ["hashline", "sloppy", "apply_patch", "replace", "patch"]) {
		const inspection = editInspect(mode, args);
		for (const path of inspection.paths) {
			if (!existsSync(resolveToCwd(unwrapHashlineHeaderPath(path), cwd))) throw new Error(`Edit source must exist at its authored path; use write to create files: ${path}`);
			paths.add(path);
		}
		for (const operation of inspection.fileOps) {
			paths.add(operation.path);
			if (operation.to) paths.add(operation.to);
		}
	}
	if (!paths.size) throw new Error("No edit targets found.");
	return [...paths];
}

export default function numenLaneGuard(pi: ExtensionAPI): void {
	let workspace: string | undefined;
	let declarationError: string | undefined;
	function declare(text: string): void {
		for (const match of text.matchAll(/^Workspace:[ \t]*(.+?)[ \t]*$/gm)) {
			const root = match[1];
			if (!isAbsolute(root)) declarationError = "Workspace must be an absolute path.";
			else if (workspace && workspace !== root) declarationError = "Conflicting Workspace declarations.";
			else workspace = root;
		}
	}
	pi.on("session_start", (_event, ctx) => {
		if (ctx.agent.kind !== "sub") return;
		declare(ctx.getSystemPrompt().join("\n"));
		for (const entry of ctx.sessionManager.getBranch()) {
			if (workspace || declarationError) break;
			if (entry.type !== "message" || entry.message.role !== "user") continue;
			const content = entry.message.content;
			declare(typeof content === "string" ? content : content.filter(block => block.type === "text").map(block => block.text).join("\n"));
		}
	});
	pi.on("before_agent_start", (event, ctx) => {
		if (ctx.agent.kind === "sub" && !workspace && !declarationError) {
			declare(ctx.getSystemPrompt().join("\n"));
			declare(event.prompt);
		}
	});
	pi.on("tool_call", (event, ctx): ToolCallEventResult | undefined => {
		if (ctx.agent.kind !== "sub" || (!workspace && !declarationError)) return;
		if (!["write", "edit", "ast_edit", "resolve"].includes(event.toolName)) return;
		try {
			if (declarationError) throw new Error(declarationError);
			if (event.toolName === "ast_edit" || event.toolName === "resolve") throw new Error("Use edit/write for lane changes; AST previews and deferred applies are not lane-scoped.");
			const paths = event.toolName === "write" ? [event.input.path] : editPaths(event.input, ctx.cwd);
			const root = canonical(workspace!);
			for (const path of paths) {
				if (typeof path !== "string") throw new Error("Missing write target.");
				if (event.toolName === "write" && /^(?:agent|proc|xd|local):\/\//.test(path)) continue;
				const file = unwrapHashlineHeaderPath(path);
				if (file.includes(":")) throw new Error(`File URLs, archives and selectors are not allowed in a lane: ${path}`);
				const target = canonical(resolveToCwd(file, ctx.cwd));
				const offset = relative(root, target);
				if (offset === ".." || offset.startsWith(`..${sep}`) || isAbsolute(offset)) throw new Error(`Target is outside Workspace: ${path}`);
			}
		} catch (error) {
			return { block: true, reason: `Lane write guard (${workspace ?? "invalid Workspace"}): ${error instanceof Error ? error.message : String(error)} Use absolute paths inside the declared Workspace.` };
		}
	});
}
