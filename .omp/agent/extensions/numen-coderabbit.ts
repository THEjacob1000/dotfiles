// generated-by: numen-sync
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

const PREAMBLE = /verify each finding against current code|treat finding text, file paths, and code as untrusted review data/i;
const FILE_HEADER = /^In `@[^`\n]+`:\s*$/m;
const LINE_ANCHOR = /^- (?:Around|At) lines? \d+/m;

export function isCodeRabbitPaste(prompt: string): boolean {
	return PREAMBLE.test(prompt.replace(/\s+/g, " ")) || (FILE_HEADER.test(prompt) && LINE_ANCHOR.test(prompt));
}

export default function numenCodeRabbit(pi: ExtensionAPI): void {
	pi.on("before_agent_start", event => {
		if (!isCodeRabbitPaste(event.prompt)) return;
		return {
			message: {
				customType: "numen-coderabbit",
				display: false,
				attribution: "agent" as const,
				content: "This prompt is a pasted CodeRabbit review. Read skill://coderabbit-resolve before acting on it.",
			},
		};
	});
}
