// generated-by: numen-sync
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

// numen-upstream-skills checks out Impeccable's OMP build here.
export function skillDir(env: NodeJS.ProcessEnv = process.env): string {
	return join(env.NUMEN_UPSTREAM_DIR || join(homedir(), ".local/share/numen/upstream"), "impeccable/.omp/skills/impeccable");
}

export function impeccablePrompt(dir: string, args: string): string {
	const command = args.trim();
	const task = command ? `the Impeccable command \`${command}\`` : "Impeccable with no command";
	return `Read ${join(dir, "SKILL.md")} and follow it for ${task}. Its <skill-base-dir> is ${dir}.`;
}

export default function numenImpeccable(pi: ExtensionAPI): void {
	pi.registerCommand("impeccable", {
		description: "Run an Impeccable design command: doctor, audit, critique, polish, shape, typeset, layout…",
		handler: async (args, ctx) => {
			const dir = skillDir();
			if (!(await Bun.file(join(dir, "SKILL.md")).exists())) {
				ctx.ui.notify(`Impeccable isn't installed at ${dir}; run numen-upstream-skills`, "warning");
				return;
			}
			pi.sendUserMessage(impeccablePrompt(dir, args));
		},
	});
}
