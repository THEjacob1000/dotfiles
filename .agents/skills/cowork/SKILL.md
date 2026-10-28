---
name: cowork
description: Choose an unclaimed outcome, work in one JJ workspace, race local main and finish cleanup through OMP.
generated-by: numen-sync
---

# One task, one workspace

Read repository instructions and `numen cowork --help`. Keep the OMP controller in
a retained checkout and use its native goal plus `cowork` custom tool. Pass the
existing task workspace explicitly as cwd to implementation, checks and review.
This skill starts no other session, changes no routing and grants no extra authority.

List taken outcomes with `cowork status`. Choose an unclaimed outcome and atomically
claim it with a distinct task id, outcome and existing absolute task-workspace path.
If another worker wins the claim, list again and choose another outcome. Advertise
intent only; there are no path reservations, integration owners or submission queues.
The shared board lives in the common JJ repository, outside disposable workspaces.
The helper returns a generation; CLI actions use `TASK@GENERATION` so stale commands
cannot change a replacement task. Actual OMP session identity is supplied by the tool.

Implement and run the repository's own checks and independent review. Use `prepare`
to read local main and rebase task work onto it in the same workspace. Resolve both
textual and semantic conflicts, then prepare and revalidate the exact settled tip.
Changing the base invalidates previous checks/review even when no conflict appears.
Use `land` with the observed base and checked/reviewed tip. The helper rejects
conflicts, blank descriptions and stale main, and holds only a short publication
lock. A loser prepares, resolves and revalidates before retrying. No candidate-copy
workspace or separate harness is involved. Never push to a remote.

After landing, stop accessing the task workspace and wait for its known cooperating
users to release it. Additional users must register with `join` before access and
release their own session afterward. The claiming OMP controller uses `release`,
then `finish` from its retained checkout. Cleanup atomically closes registration,
retains redundant source history, durably records its plan, forgets the task JJ
workspace, and quarantines its entire directory, including ignored outputs and
unknown content. It retires only recorded redundant lineage after protecting main,
named refs, external descendants and other workspaces. Clear the task advertisement
only after cleanup succeeds. A failure remains unfinished with an exact reason;
retry `finish` after resolving that blocker. Preserve unique work and `assets/voice/`.

This is cooperative ownership, not authentication or protection against arbitrary
same-UID writers. Every cooperating workspace user must register; known active
unreleased users block cleanup. Unreadable known-user identity or unknown ownership
requires explicit recovery and stays unfinished. Do not bypass denied reads or
system permissions. No scan of every ambient same-UID process is required.

The session binding and shared journal survive restart. Use `resume` for the same
session only after its prior process is positively known to have exited. Do not
steal another session's task or manufacture its release. Interrupted publication is
reconciled against actual main; interrupted cleanup reuses its exact retained plan.
Quota, cancellation and crashes leave the task advertised for recovery.

The extension blocks this session's native `goal complete` while its task remains
unfinished. Native OMP goals own continuation and respect pause, cancellation and budget stops.
The extension cannot prevent arbitrary session termination. Tool/shell interception is not a security
boundary. Completion means verified work is on local main, task workspace cleanup
and redundant-lineage retirement succeeded, and the task board entry was cleared.

Legacy `.jj/repo/numen-cowork` SQLite state is preserved and is not silently migrated.
Old owner, candidate, receipt and queue commands are unavailable. Before using a legacy
repository, stop all participants at a compatible checkpoint and invoke `cowork checkpoint`.
It refuses live leases, owners, verification and uncertain publication, retains a consistent
SQLite backup, and fences old writers in the original database. Expired unfinished records
are retained as unfinished history, not marked accepted or complete. Inspect and preserve
their source/workspaces explicitly before retiring them; never fake old approval or receipts.
