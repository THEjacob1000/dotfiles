// generated-by: numen-sync
import { readdir, readFile } from "node:fs/promises";
import { totalmem } from "node:os";
import type { UsageReport } from "@oh-my-pi/pi-ai";
import { resolveUsedFraction } from "@oh-my-pi/pi-ai/usage";
import type {
	ContextUsage,
	ExtensionAPI,
	ExtensionContext,
} from "@oh-my-pi/pi-coding-agent";
import {
	formatContextUsage,
	getContextUsageLevel,
	getContextUsageThemeColor,
} from "@oh-my-pi/pi-tui/chrome/context-thresholds";
import { renderProgressBar } from "@oh-my-pi/pi-tui/components/progress-bar";
import { formatBytes } from "@oh-my-pi/pi-tui/render/render-utils";
import type { Theme } from "@oh-my-pi/pi-tui/theme";
import { truncateToWidth, visibleWidth } from "@oh-my-pi/pi-tui/utils";

const KEY = "numen-jj";
const TIMEOUT_MS = 1500;
const MAX_OUTPUT = 4096;
const clean = (text: string) => Bun.stripANSI(text).replace(/\p{Cc}/gu, " ");
const MEMORY_CAPACITY = totalmem();

export interface StatusSnapshot {
	model: string;
	effort?: string;
	context?: ContextUsage;
	contextUnknown?: boolean;
	repository?: string;
	usage: { percent: number; reset?: number; weekly: boolean }[];
	resources?: { cpu: number | undefined; memory: number };
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
	registry: {
		authStorage: {
			usage?: {
				reports?: (options: {
					baseUrlResolver?: (provider: string) => string | undefined;
					signal?: AbortSignal;
				}) => Promise<UsageReport[] | null>;
			};
		};
		getProviderBaseUrl?: (provider: string) => string | undefined;
	},
	signal: AbortSignal,
): Promise<UsageReport[] | null> {
	const reports = registry.authStorage.usage?.reports;
	return typeof reports === "function"
		? reports
				.call(registry.authStorage.usage, {
					baseUrlResolver: (provider) => registry.getProviderBaseUrl?.(provider),
					signal,
				})
				.catch(() => null)
		: Promise.resolve(null);
}

function glyphs(theme: Theme) {
	return theme.getSymbolPreset() === "nerd"
		? { context: "\uf51e", cpu: "\uf4bc", memory: "\uefc5" }
		: { context: theme.icon.context, cpu: "cpu", memory: "mem" };
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

function contextSegment(snapshot: StatusSnapshot, theme: Theme): string {
	const context = snapshot.context;
	const tokens = context && Number.isFinite(context.tokens) && context.tokens >= 0 ? context.tokens : undefined;
	const window = context && Number.isFinite(context.contextWindow) && context.contextWindow > 0
		? context.contextWindow : 0;
	const ratio = tokens !== undefined && window > 0 && Number.isFinite(context?.percent)
		? tokens / window * 100 : undefined;
	const percent = snapshot.contextUnknown || !Number.isFinite(ratio) ? undefined : ratio;
	const contextText = tokens === undefined ? "?" : formatContextUsage(percent, window, tokens);
	const contextColor = percent === undefined
		? "statusLineContext"
		: getContextUsageThemeColor(getContextUsageLevel(percent, window));
	const bar = percent === undefined ? "" : ` ${renderProgressBar(Math.max(0, Math.min(percent, 100)), 8, {
		min: 0,
		max: 100,
		style: {
			filled: theme.symbol("progress.filled"),
			empty: theme.symbol("progress.empty"),
			styleFilled: (text) => theme.fg(contextColor, text),
			styleEmpty: (text) => theme.fg("muted", text),
		},
	})}`;
	return theme.fg(contextColor, `${glyphs(theme).context} ${contextText}`) + bar;
}

function resourceSegment(resources: StatusSnapshot["resources"], theme: Theme): string {
	if (!resources) return "";
	const cpuColor = resources.cpu !== undefined && resources.cpu >= 400
		? "error" : resources.cpu !== undefined && resources.cpu >= 100 ? "warning" : "statusLineOutput";
	const memoryColor = resources.memory >= MEMORY_CAPACITY / 2
		? "error" : resources.memory >= MEMORY_CAPACITY / 4 ? "warning" : "statusLineCost";
	return [
		theme.fg(cpuColor, `${glyphs(theme).cpu} ${resources.cpu === undefined ? "?" : `${Math.round(resources.cpu)}%`}`),
		theme.fg(memoryColor, `${glyphs(theme).memory} ${formatBytes(resources.memory)}`),
	].join(theme.fg("statusLineSep", theme.sep.dot));
}

export function renderStatus(
	snapshot: StatusSnapshot,
	width: number,
	theme: Theme,
	now = Date.now(),
): string[] {
	const sep = theme.fg("statusLineSep", theme.sep.dot);
	const first = [
		theme.fg("statusLineModel", `${theme.icon.model} ${clean(snapshot.model)}`),
		snapshot.effort ? theme.getThinkingBorderColor(snapshot.effort)(clean(snapshot.effort)) : "",
	].filter(Boolean).join(sep);
	const right = contextSegment(snapshot, theme);
	const room = Math.max(0, width - visibleWidth(right) - 1);
	const firstRow = visibleWidth(right) < width
		? `${truncateToWidth(first, room, undefined, true)} ${right}`
		: first;
	const quota = snapshot.usage.map((window) => {
		const color = window.percent >= 80 ? "error" : window.percent >= 50 ? "warning" : "muted";
		const reset = window.reset === undefined ? "" : theme.fg("muted", ` (${duration(window.reset, now)})`);
		return `${window.weekly ? "7d" : "5h"} ${theme.fg(color, `${window.percent}%`)}${reset}`;
	});
	const usage = quota.length ? `${theme.icon.time} ${quota.join(sep)}` : "";
	const third = [usage, resourceSegment(snapshot.resources, theme)].filter(Boolean).join(sep);
	return [firstRow, snapshot.repository ?? "", third].map((line) =>
		truncateToWidth(line, Math.max(0, width)),
	);
}

export interface ProcessStat {
	pid: number;
	ppid: number;
	ticks: number;
}

export function parseProcessStat(line: string): ProcessStat | undefined {
	const close = line.lastIndexOf(")");
	if (close < 0) return undefined;
	const pid = Number(line.slice(0, line.indexOf(" ")));
	const fields = line.slice(close + 1).trim().split(/\s+/);
	const ppid = Number(fields[1]);
	const user = Number(fields[11]);
	const system = Number(fields[12]);
	return [pid, ppid, user, system].every(Number.isFinite)
		? { pid, ppid, ticks: user + system }
		: undefined;
}

export interface ResourceSample {
	at: number;
	ticks: Map<number, number>;
	cpu: number | undefined;
	memory: number;
}

export async function sampleProcessTree(
	root: number,
	at: number,
	pids: readonly number[],
	read: (pid: number, file: string) => Promise<string>,
	previous?: ResourceSample,
): Promise<ResourceSample> {
	const stats = (await Promise.all(pids.map(async (pid) => {
		try {
			return parseProcessStat(await read(pid, "stat"));
		} catch {
			return undefined;
		}
	}))).filter((stat): stat is ProcessStat => stat !== undefined);
	const children = new Map<number, ProcessStat[]>();
	for (const stat of stats) {
		const siblings = children.get(stat.ppid) ?? [];
		siblings.push(stat);
		children.set(stat.ppid, siblings);
	}
	const rootStat = stats.find((stat) => stat.pid === root);
	const pending = rootStat ? [rootStat] : [];
	const ticks = new Map<number, number>();
	let memory = 0;
	let delta = 0;
	while (pending.length) {
		const stat = pending.pop()!;
		if (ticks.has(stat.pid)) continue;
		ticks.set(stat.pid, stat.ticks);
		pending.push(...(children.get(stat.pid) ?? []));
		const oldTicks = previous?.ticks.get(stat.pid);
		if (oldTicks !== undefined) delta += Math.max(0, stat.ticks - oldTicks);
		try {
			const rollup = await read(stat.pid, "smaps_rollup");
			const pss = /^Pss:\s+(\d+)\s+kB/m.exec(rollup);
			if (pss) {
				memory += Number(pss[1]) * 1024;
				continue;
			}
		} catch {
			// Rollup may be inaccessible while status remains readable.
		}
		try {
			const status = await read(stat.pid, "status");
			memory += Number(/^VmRSS:\s+(\d+)\s+kB/m.exec(status)?.[1] ?? 0) * 1024;
		} catch {
			// A process can exit between reading stat and memory.
		}
	}
	const seconds = previous ? (at - previous.at) / 1000 : 0;
	return { at, ticks, cpu: seconds > 0 && rootStat ? delta / seconds : undefined, memory };
}

async function sampleResources(previous?: ResourceSample): Promise<ResourceSample | undefined> {
	try {
		const pids = (await readdir("/proc")).filter((name) => /^\d+$/.test(name)).map(Number);
		return await sampleProcessTree(process.pid, performance.now(), pids,
			(pid, file) => readFile(`/proc/${pid}/${file}`, "utf8"), previous);
	} catch {
		return undefined;
	}
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

export async function repositoryLine(cwd: string, theme: Theme): Promise<string | undefined> {
	const signal = AbortSignal.timeout(TIMEOUT_MS);
	const [root, id, bookmark, stat, description] = await Promise.all([
		jj(["root"], cwd, signal),
		jj(
			[
				"log",
				"--no-graph",
				"-r",
				"@",
				"-T",
				'change_id.shortest(8).prefix() ++ "\\t" ++ change_id.shortest(8).rest()',
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
	return formatRepositoryLine({ root, id, bookmark, stat, description }, theme);
}

export function formatRepositoryLine(
	{ root, id, bookmark, stat, description }: {
		root: string;
		id: string | null;
		bookmark: string | null;
		stat: string | null;
		description: string | null;
	},
	theme: Theme,
): string {
	const last = stat?.split("\n").at(-1) ?? "";
	const added = /(\d+) insertion/.exec(last)?.[1] ?? "0";
	const removed = /(\d+) deletion/.exec(last)?.[1] ?? "0";
	const sep = theme.fg("statusLineSep", theme.sep.dot);
	const [prefix = "", rest = ""] = id?.split("\t") ?? [];
	return [
		theme.fg("statusLinePath", `${theme.icon.folder} ${clean(root.split("/").at(-1) ?? root)}`),
		`${theme.fg("toolDiffAdded", `+${added}`)}${theme.fg("statusLineSep", "/")}${theme.fg("toolDiffRemoved", `-${removed}`)}`,
		bookmark ? theme.fg("statusLineCost", `${theme.icon.branch} ${clean(bookmark)}`) : "",
		prefix ? theme.bold(theme.fg("accent", clean(prefix))) + theme.fg("dim", clean(rest)) : "",
		description ? theme.fg("muted", clean(description)) : "",
	].filter(Boolean).join(sep);
}

export default function (pi: ExtensionAPI) {
	let stop: (() => void) | undefined;
	let requestRender: (() => void) | undefined;
	let markCompacted: (() => void) | undefined;
	let clearCompacted: (() => void) | undefined;
	pi.on("message_end", (event) => {
		if (event.message.role === "assistant") clearCompacted?.();
		requestRender?.();
	});
	pi.on("turn_end", () => requestRender?.());
	pi.on("session_compact", () => markCompacted?.());
	pi.on("auto_compaction_start", () => markCompacted?.());
	pi.on("auto_compaction_end", () => requestRender?.());
	const install = (_event: unknown, ctx: ExtensionContext) => {
		stop?.();
		if (!ctx.hasUI || ctx.mode !== "tui") return;
		ctx.ui.setStatus(KEY, undefined);
		ctx.ui.setWidget(
			KEY,
			(tui, theme) => {
				let repository: string | undefined;
				let reports: UsageReport[] = [];
				let resources: ResourceSample | undefined;
				let contextUnknown = false;
				let disposed = false;
				let refreshing = false;
				let lastUsage = 0;
				requestRender = () => tui.requestRender();
				markCompacted = () => {
					contextUnknown = true;
					tui.requestRender();
				};
				clearCompacted = () => {
					contextUnknown = false;
				};
				const refresh = async () => {
					if (refreshing || disposed) return;
					refreshing = true;
					try {
						const refreshUsage = Date.now() - lastUsage >= 30_000;
						if (refreshUsage) lastUsage = Date.now();
						const quota = refreshUsage
							? fetchUsageReports(ctx.modelRegistry, AbortSignal.timeout(5000))
							: Promise.resolve(null);
						const [nextRepository, nextReports, nextResources] = await Promise.all([
							repositoryLine(ctx.cwd, theme),
							quota,
							sampleResources(resources),
						]);
						if (disposed) return;
						repository = nextRepository;
						if (nextReports !== null) reports = nextReports;
						if (nextResources) resources = nextResources;
						tui.requestRender();
					} finally {
						refreshing = false;
					}
				};
				const timer = setInterval(() => void refresh(), 5000);
				timer.unref();
				const dispose = () => {
					if (disposed) return;
					disposed = true;
					clearInterval(timer);
					requestRender = undefined;
					markCompacted = undefined;
					clearCompacted = undefined;
				};
				stop = dispose;
				void refresh();
				return {
					render(width) {
						const model = ctx.models.current();
						return renderStatus(
							{
								model: model?.name ?? model?.id ?? "",
								effort: pi.getThinkingLevel(),
								context: ctx.getContextUsage(),
								contextUnknown,
								repository,
								resources,
								usage: model
									? usageWindows(reports, model.provider, model.id)
									: [],
							},
							width,
							theme,
						);
					},
					invalidate() {},
					dispose,
				};
			},
			{ placement: "belowEditor" },
		);
	};
	pi.on("session_start", install);
	pi.on("session_switch", install);
	pi.on("session_shutdown", () => stop?.());
}
