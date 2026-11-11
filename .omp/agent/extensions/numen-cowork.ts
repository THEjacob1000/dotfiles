// generated-by: numen-sync
import { readFileSync, realpathSync, statSync } from "node:fs";
import { join } from "node:path";
import { isAbsolute, relative } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

interface Task { generation: string; owner: string; workspace: string; phase: string; reason?: string | null; users: Record<string, {released:boolean}>; }
interface Completion { phase: string; owner: string; tip: string; workspace: string; quarantine: string; recovery: string; device: number; inode: number; }
interface Retirement { owner: string; workspace: string; name: string; head: string; unique: string[]; }
type Board = { version?: 1; enabled?: false; legacy_checkpoint_required?: boolean; tasks: Record<string, Task>; completed: Record<string, Completion>; retired?: Record<string, Retirement> };
type Mutation = { tasks: Record<string, Task>; completed: string[]; retired: string[] };
const KEY = "numen-cowork";
type Binding = { task: string; generation: string; complete: boolean };
const inside = (root: string, path: string) => { const r = relative(root, path); return !r || (!r.startsWith("..") && !isAbsolute(r)); };

export class CoworkProtocolError extends Error {
 constructor(readonly category: "response" | "binding", readonly operation: string, readonly field: string, readonly file?: string) {
  super(category === "response" ? `invalid cowork response for ${operation} at ${field}; run numen sync to align the helper and extension` :
   `invalid cowork binding for ${operation} at ${field} in ${file ?? "the unsaved session"}; claim, join or resume the task to replace this binding`);
  this.name = "CoworkProtocolError";
 }
}
function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
const isString = (value: unknown): value is string => typeof value === "string";
const isNonempty = (value: unknown): value is string => isString(value) && value.length > 0;
const isStrings = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
function isDictionary<T>(value: unknown, guard: (entry: unknown) => entry is T): value is Record<string, T> { return isRecord(value) && Object.values(value).every(guard); }
function isTask(value: unknown): value is Task {
 return isRecord(value) && isNonempty(value.generation) && isString(value.owner) && isString(value.workspace) && isAbsolute(value.workspace) &&
  isString(value.phase) && (value.reason == null || isString(value.reason)) &&
  isDictionary(value.users, (user): user is {released:boolean} => isRecord(user) && typeof user.released === "boolean");
}
function isCompletion(value: unknown): value is Completion {
 return isRecord(value) && [value.phase, value.owner, value.tip, value.workspace, value.quarantine, value.recovery].every(isString) &&
  typeof value.device === "number" && typeof value.inode === "number";
}
function isRetirement(value: unknown): value is Retirement {
 return isRecord(value) && [value.owner, value.workspace, value.name, value.head].every(isString) && isStrings(value.unique);
}
function isBoard(value: unknown): value is Board {
 return isRecord(value) && isDictionary(value.tasks, isTask) && isDictionary(value.completed, isCompletion) &&
  (value.version === 1 ? isDictionary(value.retired, isRetirement) : !('version' in value) && value.enabled === false &&
   typeof value.legacy_checkpoint_required === "boolean" && Object.keys(value.tasks).length === 0 && Object.keys(value.completed).length === 0);
}
function isMutation(value: unknown): value is Mutation { return isRecord(value) && isDictionary(value.tasks, isTask) && isStrings(value.completed) && isStrings(value.retired); }
function bindingField(value: unknown): string | undefined {
 if (!isRecord(value) || !isNonempty(value.task)) return "numen-cowork.task";
 if (!isNonempty(value.generation)) return "numen-cowork.generation";
 if (typeof value.complete !== "boolean") return "numen-cowork.complete";
}
function isBinding(value: unknown): value is Binding { return bindingField(value) === undefined; }
function responseField(value: unknown, operation: string): string {
 if (!isRecord(value)) return "$";
 if (operation === "status" && "version" in value && value.version !== 1) return "version";
 if (!isDictionary(value.tasks, isTask)) {
  if (!isRecord(value.tasks)) return "tasks";
  for (const task of Object.values(value.tasks)) {
   if (!isRecord(task)) return "tasks[]";
   if (!isNonempty(task.generation)) return "tasks[].generation";
   if (!isString(task.owner)) return "tasks[].owner";
   if (!isString(task.workspace) || !isAbsolute(task.workspace)) return "tasks[].workspace";
   if (!isString(task.phase)) return "tasks[].phase";
   if (task.reason != null && !isString(task.reason)) return "tasks[].reason";
   if (!isRecord(task.users)) return "tasks[].users";
   if (Object.values(task.users).some(user => !isRecord(user) || typeof user.released !== "boolean")) return "tasks[].users[].released";
  }
  return "tasks[]";
 }
 if (operation === "status") {
  if (!isDictionary(value.completed, isCompletion)) return "completed[]";
  if (value.version === 1 && !isDictionary(value.retired, isRetirement)) return "retired[]";
  return "enabled/legacy_checkpoint_required";
 }
 return !isStrings(value.completed) ? "completed[]" : "retired[]";
}

/** OMP owns goals and continuation. The helper owns only cooperative task state and JJ operations. */
export default function cowork(pi: ExtensionAPI) {
 const z = pi.zod;
 let active: Binding | undefined;
 const restored = (ctx: ExtensionContext, operation = "status"): Binding | undefined => {
  const entry = ctx.sessionManager.getEntries().findLast(e => e.type === "custom" && e.customType === KEY);
  if (!entry) return undefined;
  if (entry.type !== "custom" || !isBinding(entry.data)) throw new CoworkProtocolError("binding", operation,
   entry.type === "custom" ? bindingField(entry.data) ?? "numen-cowork" : "numen-cowork", ctx.sessionManager.getSessionFile() ?? undefined);
  return entry.data;
 };
 const remember = async (ctx: ExtensionContext, binding: Binding) => { active = binding; pi.appendEntry(KEY, binding); await ctx.sessionManager.ensureOnDisk(); };
 function invoke(ctx: ExtensionContext, args: ["status"], cwd?: string): Promise<Board>;
 function invoke(ctx: ExtensionContext, args: string[], cwd?: string): Promise<Mutation>;
 async function invoke(ctx: ExtensionContext, args: string[], cwd = ctx.cwd): Promise<Board | Mutation> {
  const result = await pi.exec("numen", ["cowork", ...args], { cwd, timeout: args[0] === "status" ? 5000 : 120_000 });
  if (result.code !== 0) throw new Error(result.stderr || result.stdout || "task helper failed");
  let value: unknown;
  try { value = JSON.parse(result.stdout); } catch { throw new CoworkProtocolError("response", args[0], "$ (JSON)"); }
  if (args[0] === "status") { if (isBoard(value)) return value; }
  else if (isMutation(value)) return value;
  throw new CoworkProtocolError("response", args[0], responseField(value, args[0]));
 }
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
  if (binding && !binding.complete && !Object.entries(board.tasks).some(([id,t]) => id === binding.task && t.generation === binding.generation) && !board.completed[`${binding.task}@${binding.generation}`] && !board.retired?.[`${binding.task}@${binding.generation}`]) throw new Error("bound task journal is missing or generation changed; recover before completion");
  return tasks;
 };
 pi.registerTool({
  name: "cowork", label: "Cowork",
  description: "List taken outcomes and claim one existing JJ task workspace on the repository's filesystem. Keep this OMP controller in a retained checkout; pass workspace cwd explicitly to ordinary edit/check tools. Prepare rebases directly there; land needs exact checked/reviewed tip and observed main. Release only after task users stop accessing it; finish retains the workspace and clears its advertisement. Retire drops an unlanded claim and leaves its workspace and commits in place. No security boundary or session-termination veto.",
  parameters: z.object({
   op: z.enum(["status", "checkpoint", "claim", "join", "resume", "prepare", "land", "release", "finish", "retire"]),
   task: z.string().optional(), outcome: z.string().optional(), workspace: z.string().optional(),
   base: z.string().optional(), tip: z.string().optional(),
  }),
  async execute(_id, args, _signal, _update, ctx) {
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
   const recovering = ["claim", "join", "resume"].includes(args.op);
   const binding = recovering ? undefined : active ?? restored(ctx, args.op);
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
   if (args.op === "claim") {
    const pendingBinding = {task:args.task,generation:"pending",complete:false};
    let corrupt = false;
    try { restored(ctx, args.op); } catch (error) { if (!(error instanceof CoworkProtocolError)) throw error; corrupt = true; }
    if (corrupt) active = pendingBinding;
    else await remember(ctx, pendingBinding);
   }
   let result: Mutation;
   try { result = await invoke(ctx, command, ["finish", "release", "retire"].includes(args.op) ? ctx.cwd : workspace); }
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
   if (args.op === "claim") {
    const claimed = result.tasks[args.task];
    if (!claimed || claimed.owner !== who) throw new CoworkProtocolError("response", args.op, "tasks[].owner");
    await remember(ctx, { task: args.task, generation: claimed.generation, complete: false });
   }
   else if (args.op === "finish" || args.op === "retire") {
    if (!(args.op === "finish" ? result.completed : result.retired).includes(taskRef)) throw new CoworkProtocolError("response", args.op, args.op === "finish" ? "completed[]" : "retired[]");
    if (!record) throw new CoworkProtocolError("response", args.op, "tasks[]");
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
   let binding: Binding | undefined;
   try { binding = active ?? restored(ctx, "goal complete"); }
   catch (bindingError) { return { block: true, reason: `Cannot confirm task completion: ${String(bindingError)}` }; }
   if (binding?.complete === false) return { block: true, reason: `Cannot confirm task completion: ${String(error)}. Preserve and recover its task board.` };
   ctx.ui.notify(`Cowork warning: ${String(error)}`, "warning");
  }
 });
 pi.on("session_start", async (_event, ctx) => {
  active = restored(ctx);
  try {
   const entry = (await pending(ctx))[0];
   if(entry) active = {task:entry[0], generation:entry[1].generation, complete:false};
  } catch (error) {
   if (error instanceof CoworkProtocolError) throw error;
   // An unavailable helper or repository cannot infer a cowork task.
  }
 });
 // Subagents share the OMP PID; session teardown, not host exit, releases their participation.
 pi.on("session_shutdown", async (_event, ctx) => {
  try {
   const board = await invoke(ctx, ["status"]);
   const who = ctx.sessionManager.getSessionId();
   for (const [id, task] of Object.entries(board.tasks)) {
    if (!task.users[who] || task.users[who].released || (task.owner === who && task.phase !== "landed")) continue;
    try { await invoke(ctx, ["release", `${id}@${task.generation}`, who]); }
    catch (error) { ctx.ui.notify(`Cowork release warning: ${String(error)}`, "warning"); }
   }
  } catch (error) { ctx.ui.notify(`Cowork shutdown warning: ${String(error)}`, "warning"); }
 });
}
