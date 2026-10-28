// generated-by: numen-sync
import { readFileSync, realpathSync, statSync } from "node:fs";
import { join } from "node:path";
import { isAbsolute, relative } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

interface Task { generation: string; owner: string; workspace: string; phase: string; reason?: string; users: Record<string,{released:boolean}>; }
type Board = { version?: number; enabled?: boolean; legacy_checkpoint_required?: boolean; tasks: Record<string, Task>; completed: Record<string, Task> };
const KEY = "numen-cowork";
type Binding = { task: string; generation: string; complete: boolean };
const inside = (root: string, path: string) => { const r = relative(root, path); return !r || (!r.startsWith("..") && !isAbsolute(r)); };

/** OMP owns goals and continuation. The helper owns only cooperative task state and JJ operations. */
export default function cowork(pi: ExtensionAPI) {
 const z = pi.zod;
 let active: Binding | undefined;
 const restored = (ctx: ExtensionContext): Binding | undefined => {
  const entries = ctx.sessionManager.getEntries().filter(e => e.type === "custom" && e.customType === KEY);
  return (entries.at(-1) as { data?: Binding } | undefined)?.data;
 };
 const remember = async (ctx: ExtensionContext, binding: Binding) => { active = binding; pi.appendEntry(KEY, binding); await ctx.sessionManager.ensureOnDisk(); };
 const invoke = async (ctx: ExtensionContext, args: string[], cwd = ctx.cwd) => {
  const result = await pi.exec("numen", ["cowork", ...args], { cwd, timeout: args[0] === "status" ? 5000 : 120_000 });
  if (result.code !== 0) throw new Error(result.stderr || result.stdout || "task helper failed");
  return JSON.parse(result.stdout);
 };
 const pending = async (ctx: ExtensionContext): Promise<[string, Task][]> => {
  const board: Board = await invoke(ctx, ["status"]);
  const session = ctx.sessionManager.getSessionId();
  const tasks = Object.entries(board.tasks).filter(([, t]) => t.owner === session || Boolean(t.users[session] && !t.users[session].released));
  let binding = active ?? restored(ctx);
  if (binding?.generation === "pending" && board.version === 1) {
   const won = board.tasks[binding.task];
   await remember(ctx, {task:binding.task,generation:won?.owner === session ? won.generation : "not-claimed",complete:won?.owner !== session});
   binding = active;
  }
  if (binding && !binding.complete && !Object.entries(board.tasks).some(([id,t]) => id === binding.task && t.generation === binding.generation) && !board.completed[`${binding.task}@${binding.generation}`]) throw new Error("bound task journal is missing or generation changed; recover before completion");
  return tasks;
 };
 pi.registerTool({
  name: "cowork", label: "Cowork",
  description: "List taken outcomes and claim one existing JJ task workspace. Keep this OMP controller in a retained checkout; pass workspace cwd explicitly to ordinary edit/check tools. Prepare rebases directly there; land needs exact checked/reviewed tip and observed main. Release only after task users stop accessing it; finish retains the workspace and clears its advertisement. No security boundary or session-termination veto.",
  parameters: z.object({
   op: z.enum(["status", "checkpoint", "claim", "join", "resume", "prepare", "land", "release", "finish"]),
   task: z.string().optional(), outcome: z.string().optional(), workspace: z.string().optional(),
   base: z.string().optional(), tip: z.string().optional(),
  }),
  async execute(_id, args, _update, ctx) {
   const who = ctx.sessionManager.getSessionId();
   if (args.op === "status") return { content: [{ type: "text", text: JSON.stringify(await invoke(ctx, ["status"])) }] };
   if (args.op === "checkpoint") return { content: [{type:"text", text:JSON.stringify(await invoke(ctx,["checkpoint"]))}] };
   if (!args.task) throw new Error("task required");
   const board: Board = await invoke(ctx, ["status"]);
   const tasks = board.tasks;
   let workspace = args.workspace ?? tasks[args.task]?.workspace;
   if (!workspace || !isAbsolute(workspace)) throw new Error("absolute existing task workspace required");
   if (inside(workspace, ctx.cwd)) throw new Error("keep the OMP controller in a retained checkout outside its task workspace");
   if (args.op === "claim") {
    const repository = async (cwd: string) => {
     const result = await pi.exec("jj", ["--ignore-working-copy", "root"], { cwd, timeout: 5000 });
     if (result.code !== 0) throw new Error(result.stderr || "JJ root unavailable");
     const root = result.stdout.trim(); const marker = join(root, ".jj/repo");
     return realpathSync(statSync(marker).isDirectory() ? marker : join(root, ".jj", readFileSync(marker, "utf8").trim()));
    };
    if (await repository(ctx.cwd) !== await repository(workspace)) throw new Error("controller and task workspace must share a JJ repository");
   }
   const record = tasks[args.task];
   const binding = active ?? restored(ctx);
   if (args.op !== "claim" && binding?.task === args.task && binding.generation !== "pending" && record?.generation !== binding.generation) throw new Error("stale task generation");
   const taskRef = record ? `${args.task}@${record.generation}` : args.task;
   let command: string[];
   switch (args.op) {
    case "claim":
     if (!args.outcome?.trim()) throw new Error("outcome required; list tasks first and retry selection after a lost claim");
     command = ["claim", args.task, who, String(process.pid), args.outcome]; break;
    case "join": case "resume": command = [args.op, taskRef, who, String(process.pid)]; break;
    case "land":
     if (!args.base || !args.tip) throw new Error("exact observed main and checked/reviewed tip required");
     command = ["land", taskRef, who, args.base, args.tip]; break;
    default: command = [args.op, taskRef, who];
   }
   if (args.op === "claim") await remember(ctx, {task:args.task,generation:"pending",complete:false});
   let result;
   try { result = await invoke(ctx, command, args.op === "finish" || args.op === "release" ? ctx.cwd : workspace); }
   catch (error) {
    if (args.op === "claim") {
     try {
      const observed: Board = await invoke(ctx, ["status"]);
      if (observed.version !== 1) throw new Error("claim outcome is still uncertain");
      const won = observed.tasks[args.task];
      if (won?.owner === who) await remember(ctx, {task:args.task,generation:won.generation,complete:false});
      else await remember(ctx, {task:args.task,generation:"not-claimed",complete:true});
     } catch { /* Unknown claim outcome remains bound as pending; no success is inferred. */ }
    }
    throw error;
   }
   if (args.op === "claim") await remember(ctx, { task: args.task, generation: result.tasks[args.task].generation, complete: false });
   else if (args.op === "finish") {
    if (!result.completed.includes(taskRef)) throw new Error("cleanup did not confirm completion and board clearing");
    await remember(ctx, { task: args.task, generation: record.generation, complete: true });
   } else if (record) await remember(ctx, { task: args.task, generation: record.generation, complete: args.op === "release" && record.owner !== who });
   return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
 });
 // This gates the native goal completion request for this session, not shell access or termination.
 pi.on("tool_call", async (event, ctx) => {
  if (event.toolName !== "goal" || event.input.op !== "complete") return;
  try {
   const tasks = await pending(ctx);
   if (tasks.length) return { block: true, reason: `Task remains unfinished: ${tasks.map(([id, t]) => `${id}: ${t.phase}${t.reason ? ` (${t.reason})` : ""}`).join("; ")}. Land, release, finish cleanup and clear the board before completing the goal.` };
  } catch (error) {
   if ((active ?? restored(ctx))?.complete === false) return { block: true, reason: `Cannot confirm task completion: ${String(error)}. Preserve and recover its task board.` };
  }
 });
 pi.on("session_start", async (_event, ctx) => {
  active = restored(ctx);
  try { const entry = (await pending(ctx))[0]; if(entry) active = {task:entry[0], generation:entry[1].generation, complete:false}; } catch { /* Not a JJ repository: no cowork task is inferred. */ }
 });
}
