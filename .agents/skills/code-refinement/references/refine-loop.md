# Refine loop

`numen refine` finds and tracks debt; it does not replace code-golf, language guidance, independent review, or the selected verification gate. Run from the owned project root, or pass `--path DIR` consistently. State lives under `.numen-refine/` at that root; `--state FILE` selects the inventory ledger, with relative paths resolved against the root. Keep the same root and state throughout the run. Scan and planning write bookkeeping even during a source-only audit; an audit never applies fixes. Use `--json` for machine-readable output and read `numen refine <verb> --help` before using additional options. `langs` lists the registered language surface; don't assume every language has every detector or fixer.

## Baseline and execution

```sh
numen refine scan
numen refine status
numen refine next
numen refine backlog --count 100 --json
```

Take the selected native or strict gate baseline separately. Inspect the scan's coverage and errors: an incomplete scan is not a clean inventory. `next` is the execution queue shaped by the living plan; `backlog` exposes work outside that queue. Use `show PATTERN --code` to inspect a finding and its evidence. A scoped request stays scoped: `next --scope RELPATH` selects an exact file or directory subtree, not a glob, while `--lang LANG` selects scan inputs/report views. Neither licenses unrelated changes. Keep a whole-inventory baseline for a sweep, then route findings by real component ownership. A scanner hit is a lead, not proof of a defect or permission to delete code.

Read the score channels separately: overall penalizes unresolved findings (`open`, `deferred`, and `triaged_out`), objective covers mechanical checks only, and strict additionally penalizes `wontfix` and `auto_resolved`. Verified strict uses the mechanical pool only and penalizes unresolved findings plus `wontfix`, `fixed`, and `false_positive`, so its gap from strict is not solely a verification gap. Only findings still open can become `auto_resolved` when they disappear in a scan; operator-closed findings retain their status and verified-strict penalty after a confirming scan. Zero wontfix findings therefore does not make overall and strict equal.

Follow queued workflow and triage work before coding. For each accepted finding or cluster, apply the entrypoint's choose/change and proof rules. Fixers edit only their owned files; one verifier checks the stable integrated stage. After the fix and its verification, resolve the exact finding ID or inspected pattern:

```sh
numen refine resolve ID --status fixed --note 'Concrete change and observed verification' --attest 'I have actually fixed and verified this issue; I am not gaming the score.'
numen refine plan resolve CLUSTER --status fixed --note 'Concrete change and observed verification' --attest 'I have actually fixed and verified this cluster; I am not gaming the score.'
```

Replace the example evidence with what actually happened. Both resolution paths require an explicit attestation text containing `I have actually` and `not gaming` (case/spacing insensitive) when closing real findings; `--confirm` does not manufacture one. `wontfix` and `false_positive` require a concrete `--note` justification of at least 50 characters; they are dispositions, not verified fixes. Wontfix batches over ten require `--confirm` as well. Reopen mistaken resolutions with `--status open`; don't use forced resolution to bypass unfinished work. Inspect the matched set before bulk mutation and respect cluster guards.

Finish the coherent execution stage, then run `scan`, `status`, and `next` again to confirm disappearance, detect recurrence/cascades, and refresh priorities. A completed subjective assessment import permits one follow-up rescan even while imported findings remain open; importing and completing triage does not resolve those findings. After that refresh, the scan gate may refuse another rescan while planned work remains. A source-only audit leaves accepted defects open rather than claiming fixes. If a later audit scan needs to bypass outstanding work, use an explicitly authorized `scan --force-rescan --attest TEXT` with text containing `I understand`, explain the intentionally unfixed work, and disclose the recorded bypass. For focused work, explicitly defer unrelated queued findings with `plan skip PATTERN --note TEXT`, explaining their ownership and why they remain outside this request; keep them in the backlog, not falsely fixed or wontfix. Never replace the verification baseline or use `--profile ci` to evade the execution gate. A resolution is an operator claim until the rescan confirms the detector's result; neither proves the native checks passed. End only with the requested scope covered and the entrypoint's verification/closure evidence, not merely an improved score or empty filtered queue.

## Living plan and triage

```sh
numen refine plan show
numen refine plan queue
numen refine plan triage --start
numen refine plan triage --show-requirements
numen refine plan triage --stage-prompt STAGE --json
```

The stage order is strategize → observe → reflect → organize → enrich → sense-check, followed by `--complete`. Strategize has no prerequisites; observe requires strategize. Follow the reported dependencies and gates within that order, not a shortcut. `--stage-prompt STAGE --json` provides stage-specific guidance; use it with the current requirements and live findings to prepare the report. Read the relevant source, then record and explicitly confirm each stage, including strategize: recording is not confirmation. `plan triage STAGE` is not a recording command. These templates require actual evidence in `REPORT`, `stage_attestation`, and `strategy`:

```sh
numen refine plan triage --stage STAGE --report-file REPORT
numen refine plan triage --confirm STAGE --attestation "$stage_attestation"
numen refine plan triage --complete --strategy "$strategy"
```

A JSON `REPORT` uses the closed `StageEvidence` fields `report`, `citations`, `dimensions`, `recurring_dimensions`, `assessments`, `clusters`, and `score_trend`; omitted known fields default empty, but unknown fields are rejected. `assessments` is a list of `[finding_key, {"verdict": ..., "reasoning": ..., "files_read": [...]}]` pairs, not a keyed object; use actual keys from the live findings. Reports need at least 100 characters, including strategize (50 for observe/reflect/organize with at most three active IDs). Observe needs zero citations for no active IDs, otherwise `(active IDs / 10)` clamped to 1–5. Stage attestations need at least 80 characters and stage-specific references, distinct from finding-resolution phrases; strategize confirmation can cite concrete report wording, dimensions, or `score_trend`. A legacy `auto-confirmed` attestation is not explicit confirmation and must be confirmed again. Strategy needs at least 200 characters. Satisfy the prompt's source/coverage and action-step checks as well as length; don't pad prose to pass. Confirm organize and enrich before recording their dependent stages. Confirm sense-check explicitly or supply its confirmation through `--attestation` at completion. Re-recording upstream evidence removes later reports, not just their confirmations: rerecord and reconfirm affected later stages against the changed plan. Use the human stage name `sense-check` in commands. Provider triage runners are unsupported: the orchestrator records evidence and owns confirmation.

Observe verdicts do not themselves close or skip ledger findings. Before completion or confirming an existing triage, explicitly resolve legitimate false positives with honest evidence, or use `plan skip` for accepted out-of-scope deferrals; completion refuses still-live observe dismissals. Never resolve an unfixed true positive just to remove it from the execution queue.

Group shared root causes and coordinated cutovers, not arbitrary equal-sized slices:

```sh
numen refine plan cluster create NAME --description 'Shared obligation and cutover'
numen refine plan cluster add NAME ID...
numen refine plan cluster show NAME
numen refine plan cluster update NAME --add-step 'Repair boundary' --detail 'Concrete change and proof obligation' --effort small --issue-refs ID --paths src/a.rs src/b.rs
numen refine plan focus NAME
numen refine next --cluster NAME --json
numen refine plan reorder PATTERN top
```

Clusters organize work; they do not establish safe parallelism. Completion orders manual clusters using dependency order and the first exact, word-boundary cluster-name mention in the strategy; remaining clusters follow name order. Numeric cluster priority is display-only, not an execution-order override. Name clusters in the intended dependency order, then inspect `plan queue`; use `plan reorder` for explicit later adjustments. Action-step `--paths` accepts project-relative space-separated values with `--add-step` or `--update-step`, not as a standalone cluster option. A `--steps-file` can provide comma-separated paths or a JSON array on an indented `Paths:` line beneath a numbered step, alongside `Refs:` and `Effort: trivial|small|medium|large` metadata. Use a JSON array for filenames containing commas and `Detail:` to escape prose that resembles reserved metadata. Don't bury paths in prose to satisfy enrichment. Use the entrypoint's dependency stages and file ownership for fix lanes. Revisit `backlog` and plan coverage before declaring a sweep complete; request an explicit `--count` when enumerating backlog rather than treating a limited response as the whole inventory. Focused work need not drain unrelated project debt.

## Independent review batches

```sh
numen refine review dimensions --lang LANG --json
numen refine review prepare --lang LANG --holistic --json
```

Prepare one registered language at a time. The output's `artifacts` supplies the immutable blind packet, `prompts` in batch order, and `results_dir`; use those returned paths rather than guessing filenames. Review preparation can refuse a rerun until backlog is drained. An explicitly authorized `--force-review-rerun` requires `--attest TEXT` containing `I have actually` and `not gaming` and records the bypass; disclose it and its concrete reason. Don't force reruns to chase a target score. Use canonical action words (`review prepare`, `review import FILE`, `review validate FILE`, and `review external-submit FILE`), the global `--lang`, and `--batch-max-files`; legacy action flags and language/batch-size aliases are unsupported.

The design-coherence batch derives concern signals from the scoped ledger and current plan dismissals; inspect these leads rather than treating them as proven defects, and copy an exact concern fingerprint only when one is supplied. Holistic context's architecture, coupling, conventions, errors, abstractions, dependencies, and testing fields are structured objects containing source cues, graph/directory evidence, and references to shared scan findings, not a substitute for reading the source. Issue `related_files` may cite any existing, nonexcluded file canonically confined to the project root, including loaded data, configuration, and cross-language evidence. `reviewed_files` remains limited to the prepared source scope and supported language manifests that are ancestors of in-scope source files, such as `Cargo.toml`, `go.mod`, `package.json`, `pyproject.toml`, `pubspec.yaml`, or a `.csproj`. Evidence acceptance does not bypass root confinement or exclusions, expand authorized review dimensions, or establish production source-cache coverage for data or test files.

Use the `task` tool to launch one independent read-only general `task` reviewer per returned prompt, not a `scout`, in bounded waves within the session's concurrency limit. Give each reviewer the project root and its prompt path; use `outputSchema` matching the generated payload to enforce structured output. Require reading the complete generated prompt and blind packet, following their dimensions/rubrics and JSON example, and inspecting complete relevant function bodies, callers, error paths, and tests beyond the seed files. Header-only skimming and plausible scores are not a completed review. Require concrete file/line evidence for defects and only list files actually read. Reviewers return only the generated payload: no edits, verification commands, other reviewers' conclusions, prior scores, or desired score targets. The orchestrator writes each returned payload to a distinct path under `results_dir` and checks its coverage and evidence before accepting it; the CLI does not prove that the source was read. Retry failed or shallow/incomplete batches without inventing missing evidence or omitting requested dimensions. The separate implementation review still uses the entrypoint's independent code-review gate.

Collect a valid payload for every prepared prompt before calling the review complete. The orchestrator merges them into one import JSON: combine `issues`, `reviewed_files`, and `dismissed_concerns`, and reconcile dimension-keyed `assessments` and `context_updates` from source evidence. Deduplicate the same defect; resolve contradictory judgments rather than overwrite them or choose the highest score. Preserve required judgment, component-score, and concern fields from the generated schema; judgment fields are closed, so do not add `annotation: null` or other fields absent from the example. `reviewed_files` names only files actually read. Reviewer output cannot select import scope or its own trust policy; imports reconcile only the authorized language and reviewed dimensions. Import before fixing so findings enter tracked state.

When re-reporting a review defect listed in the packet's scoped issue history under a new identifier, copy its exact `historical_key` into the issue payload. Only offered `Review` identities can be linked; concern-backed findings are not offered as historical targets. Links must preserve detector, recorded language, and dimension; a legacy finding without a recorded language adopts the authorized review language. History budgets apply per dimension, so recent findings in one dimension do not hide another dimension's identities. History includes related data, test, and manifest evidence, but ancillary citations do not bring unselected owning sources into scope. File-scoped imports retain unselected findings rather than resolving them as absent. Unknown keys, operator-disposition targets (`wontfix`, `false_positive`, `deferred`, and `triaged_out`), merged duplicates, and conflicting distinct links are refused before mutation. Do not manufacture links to unrelated findings to avoid reporting a new defect.

Historical links require a bound packet. Regenerate packets after the packet schema changes; imports require the prepared finding-scope and reviewed-file-scope metadata. Manual `--packet` authorizes the selected root-confined packet's exact bytes, not a recorded preparation; authenticated external submissions check the packet against their recorded session authorization. Both check the packet binding before using history or stale-resolution scope. Issue-only reviewer output need not echo provenance; scored attested imports still require the provenance described below.

Report concrete defects even when a summary begins with “strong”, “clean”, “well”, or “good”; those prefixes do not make a defect positive feedback. Put strengths in the generated judgment/context positive-insight fields rather than inventing a defect or relying on summary filtering.

```sh
numen refine review validate MERGED --lang LANG --packet BLIND_PACKET
numen refine review import MERGED --lang LANG --packet BLIND_PACKET
numen refine review status --json
```

Use the prepared language consistently. Relative `MERGED` and `--packet` paths resolve against the project root. Default imports track issues only, not scored assessments. Durable scored imports require genuinely independent Claude review: for the attested path, add `--attested-external --attest TEXT` to validate/import with text containing `without awareness` and `unbiased`. Set merged `provenance.runner` to the actual `"claude"` runner, `packet_path` to `artifacts.blind_packet` with the project-root prefix removed, and `packet_sha256` to `artifacts.packet_sha256`. A Claude runner means the actual Claude model performed the review, not an agent merely named Claude. Never relabel another OMP model; import its issues without claiming scored assessments. For concern dismissals, the same single `--attest` text must also contain `I have actually` and `not gaming`. Don't use manual overrides or partial imports to disguise an invalid review.

Inspect `review status --json` after import: the audit distinguishes trusted internal, attested-external, and authenticated-external review. Attested imports retain the supplied operator attestation; authenticated external submissions retain the session ID and canonical packet/runner provenance, not the secret token. Supplied but unverified provenance is explicitly marked `provenance_verified: false`; do not mistake its presence for authenticated provenance. The historical `"Trusted"` policy value represents an undifferentiated legacy record, not proof of a newly authorized external review. An authenticated session or explicitly selected `--packet` supplies the language when `--lang` is omitted; other imports require an explicit `--lang`, even if a prior preparation exists. An explicit language must match the prepared scope. Concern-backed issue paths undergo the same root/scope checks as other evidence.

An import's `--dimensions` restriction requires explicit packet authorization; an unbound manual import refuses that option rather than silently ignoring it. Authenticated external submissions take scope from their session and reject caller `--packet` and `--dimensions` overrides.

Transactional writes keep inventory, plan audit, configuration, and review-session state consistent through rollback or recovery. JSON errors distinguish `kind: "committed"` (exit 3) from `kind: "commit_uncertain"` (exit 4); both set `retry_safe: false`. Do not automatically repeat either operation: inspect the recovered inventory and review status first. A committed error means the mutation completed but a later persistence step failed; an uncertain error does not establish whether the commit became durable.

The authenticated Claude session route is also available: `review external-start --lang LANG --external-runner claude` prepares prompts and a local session template. Preserve the returned session ID/token in merged output and submit with `review external-submit MERGED --session-id ID`; the local session owns language and dimension scope. Don't manufacture credentials or claim an independent Claude session for another model. Provider batch runners and skill installers are unsupported; `task` owns fan-out and the orchestrator owns merge/import. After importing all language reviews, return to `next` and triage. Use the permitted post-assessment rescan to refresh audit evidence when needed, not to mark unfixed review issues resolved; later rescans follow the scan-gate policy above.

## Assisted edits and scope controls

- `autofix list` lists real fixers. Preview `autofix FIXER --dry-run`, inspect its matched files and proposed edits, then apply `autofix FIXER` only within settled ownership. Automatic ledger updates are not verification: inspect the result, run the selected checks, and rescan.
- Preview `move SOURCE DEST --dry-run` before `move SOURCE DEST`. Paths are project-relative; the mover rewrites supported references, not every external contract. Inspect callers, manifests, generated wiring, and unsupported references, complete the cutover, verify, and rescan. Don't combine move with language/exclusion filters that the command refuses.
- `exclude PATTERN --attest TEXT` persists a path exclusion and removes matching tracked findings/plan entries. The explicit attestation must contain `I have actually` and `not gaming`; removals are audited. Use only positive ownership evidence for out-of-scope vendor/generated trees; the global `--exclude PATTERN` is temporary. Never exclude owned failing code to improve the score.
- `suppress PATTERN --attest TEXT` persists a finding ignore rule, not a source-code lint allowance. Put the required attestation phrases and concrete exception reason in that one text; report retained debt. Never suppress instead of fixing an accepted defect or hide verification diagnostics.
- `zone show`, `zone set RELPATH ZONE`, and `zone clear RELPATH` inspect/correct classification. Set zones from actual ownership/use, never to remove production debt from scoring. `config show` exposes persisted policy; keep policy changes explicit and don't weaken it mid-run to pass.
