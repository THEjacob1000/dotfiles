// generated-by: numen-sync
import type { UsageReport } from "@oh-my-pi/pi-ai";
import { resolveUsedFraction } from "@oh-my-pi/pi-ai/usage";
import type {
	ContextUsage,
	ExtensionAPI,
	ExtensionContext,
} from "@oh-my-pi/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@oh-my-pi/pi-tui/utils";

const KEY = "numen-jj";
const TIMEOUT_MS = 1500;
const MAX_OUTPUT = 4096;
const color = (code: number, text: string) =>
	`\x1b[38;5;${code}m${text}\x1b[0m`;
const separator = color(240, " | ");
const clean = (text: string) => Bun.stripANSI(text).replace(/\p{Cc}/gu, " ");

export interface StatusSnapshot {
	model: string;
	effort?: string;
	context?: ContextUsage;
	repository?: string;
	usage: { percent: number; reset?: number; weekly: boolean }[];
}

export function usageWindows(
	reports: UsageReport[],
	provider: string,
	model: string,
): StatusSnapshot["usage"] {
	const limits = reports
		.filter((report) => report.provider === provider)
		.flatMap((report) => report.limits)
		.filter(
			(limit) =>
				!limit.scope.tier &&
				(!limit.scope.modelId || limit.scope.modelId === model),
		)
		.sort(
			(a, b) =>
				Number(Boolean(b.scope.modelId)) - Number(Boolean(a.scope.modelId)),
		);
	return [false, true].flatMap((weekly) => {
		const duration = (weekly ? 7 * 24 : 5) * 3_600_000;
		const limit = limits.find(
			(candidate) =>
				candidate.window?.id === (weekly ? "7d" : "5h") ||
				candidate.window?.durationMs === duration,
		);
		const fraction = limit && resolveUsedFraction(limit);
		return fraction === undefined || !Number.isFinite(fraction)
			? []
			: [
					{
						percent: Math.round(fraction * 100),
						reset: limit?.window?.resetsAt,
						weekly,
					},
				];
	});
}

export function fetchUsageReports(
	authStorage: {
		fetchUsageReports?: (signal: AbortSignal) => Promise<UsageReport[] | null>;
	},
	signal: AbortSignal,
): Promise<UsageReport[] | null> {
	return typeof authStorage.fetchUsageReports === "function"
		? authStorage.fetchUsageReports(signal).catch(() => null)
		: Promise.resolve(null);
}

function duration(reset: number, now: number): string {
	const minutes = Math.max(0, Math.floor((reset - now) / 60_000));
	const hours = Math.floor(minutes / 60);
	return hours >= 24
		? `${Math.floor(hours / 24)}d ${hours % 24}h`
		: hours
			? `${hours}h${String(minutes % 60).padStart(2, "0")}m`
			: `${minutes}m`;
}

export function renderStatus(
	snapshot: StatusSnapshot,
	width: number,
	now = Date.now(),
): string[] {
	const parts = [
		snapshot.effort ? color(103, `Thinking: ${clean(snapshot.effort)}`) : "",
		color(110, clean(snapshot.model)),
		snapshot.usage.length
			? color(
					73,
					snapshot.usage
						.map(
							(window) =>
								`${window.weekly ? "Weekly" : "Session"}: ${window.percent}%`,
						)
						.join(" | "),
				)
			: "",
	].filter(Boolean);
	const left = parts.join(separator);
	const context = snapshot.context;
	let right = "";
	if (
		context &&
		context.contextWindow > 0 &&
		Number.isFinite(context.percent)
	) {
		const percent = Math.max(0, Math.min(100, context.percent));
		const filled = Math.round((percent / 100) * 16);
		const tokens = (value: number) =>
			value >= 999500
				? `${Number((value / 1_000_000).toFixed(1))}M`
				: value >= 1000
					? `${Math.round(value / 1000)}k`
					: String(value);
		right = color(
			173,
			`Context: [${"█".repeat(filled)}${"░".repeat(16 - filled)}] ${tokens(context.tokens)}/${tokens(context.contextWindow)} (${Math.round(percent)}%)`,
		);
	}
	const available = Math.max(0, width - visibleWidth(right) - 1);
	const first =
		right && available > 0
			? `${truncateToWidth(left, available)}${" ".repeat(Math.max(1, width - Math.min(visibleWidth(left), available) - visibleWidth(right)))}${right}`
			: left;
	const resets = snapshot.usage
		.filter((window) => window.reset !== undefined)
		.map(
			(window) =>
				`${window.weekly ? "Weekly Reset" : "Reset"}: ${duration(window.reset ?? now, now)}`,
		)
		.join(" | ");
	return [first, snapshot.repository ?? "", color(66, resets)].map((line) =>
		truncateToWidth(line, Math.max(0, width)),
	);
}

async function capture(stream: ReadableStream<Uint8Array>): Promise<string> {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let out = "";
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		out = (out + decoder.decode(value, { stream: true })).slice(-MAX_OUTPUT);
	}
	return out;
}

async function jj(
	args: string[],
	cwd: string,
	signal: AbortSignal,
): Promise<string | null> {
	try {
		const run = Bun.spawn(["jj", "--ignore-working-copy", ...args], {
			cwd,
			signal,
			stdout: "pipe",
			stderr: "ignore",
		});
		const text = await capture(run.stdout);
		await run.exited;
		return run.exitCode === 0 ? text.trim() : null;
	} catch {
		return null;
	}
}

export async function repositoryLine(cwd: string): Promise<string | undefined> {
	const signal = AbortSignal.timeout(TIMEOUT_MS);
	const [root, id, bookmark, stat, description] = await Promise.all([
		jj(["root"], cwd, signal),
		jj(
			[
				"--color=always",
				"log",
				"--no-graph",
				"-r",
				"@",
				"-T",
				"change_id.shortest(8)",
			],
			cwd,
			signal,
		),
		jj(
			[
				"log",
				"--no-graph",
				"-n",
				"1",
				"-r",
				"heads(::@ & bookmarks())",
				"-T",
				"bookmarks",
			],
			cwd,
			signal,
		),
		jj(["diff", "--stat"], cwd, signal),
		jj(
			[
				"log",
				"--no-graph",
				"-r",
				"@",
				"-T",
				'if(description, description.first_line(), "(no description)")',
			],
			cwd,
			signal,
		),
	]);
	if (!root) return undefined;
	const last = stat?.split("\n").at(-1) ?? "";
	const added = /(\d+) insertion/.exec(last)?.[1] ?? "0";
	const removed = /(\d+) deletion/.exec(last)?.[1] ?? "0";
	return [
		color(108, clean(root.split("/").at(-1) ?? root)),
		id,
		bookmark ? color(72, `\uf126 ${clean(bookmark)}`) : "",
		`${color(245, "(")}${color(71, `+${added}`)}${color(245, ",")}${color(131, `-${removed}`)}${color(245, ")")}`,
		description ? color(245, clean(description)) : "",
	]
		.filter(Boolean)
		.join(separator);
}

export default function (pi: ExtensionAPI) {
	let stop: (() => void) | undefined;
	const install = (_event: unknown, ctx: ExtensionContext) => {
		stop?.();
		if (!ctx.hasUI || ctx.mode !== "tui") return;
		ctx.ui.setStatus(KEY, undefined);
		ctx.ui.setWidget(
			KEY,
			(tui) => {
				let repository: string | undefined;
				let reports: UsageReport[] = [];
				let disposed = false;
				let refreshing = false;
				let lastUsage = 0;
				const refresh = async () => {
					if (refreshing || disposed) return;
					refreshing = true;
					try {
						const refreshUsage = Date.now() - lastUsage >= 30_000;
						if (refreshUsage) lastUsage = Date.now();
						const quota = refreshUsage
							? fetchUsageReports(
									ctx.modelRegistry.authStorage,
									AbortSignal.timeout(5000),
								)
							: Promise.resolve(null);
						const [nextRepository, nextReports] = await Promise.all([
							repositoryLine(ctx.cwd),
							quota,
						]);
						if (disposed) return;
						repository = nextRepository;
						if (nextReports !== null) {
							reports = nextReports;
						}
						tui.requestRender();
					} finally {
						refreshing = false;
					}
				};
				const timer = setInterval(() => void refresh(), 5000);
				timer.unref();
				stop = () => {
					disposed = true;
					clearInterval(timer);
				};
				void refresh();
				return {
					render(width) {
						const model = ctx.models.current();
						return renderStatus(
							{
								model: model?.name ?? model?.id ?? "",
								effort: pi.getThinkingLevel(),
								context: ctx.getContextUsage(),
								repository,
								usage: model
									? usageWindows(reports, model.provider, model.id)
									: [],
							},
							width,
						);
					},
					invalidate() {},
					dispose: stop,
				};
			},
			{ placement: "belowEditor" },
		);
	};
	pi.on("session_start", install);
	pi.on("session_switch", install);
	pi.on("session_shutdown", () => stop?.());
}
