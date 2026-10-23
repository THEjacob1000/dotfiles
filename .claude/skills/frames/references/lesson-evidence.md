# Lesson evidence

Grounding establishes exact references and snapshots, not the truth of prose. Review every architecture assertion against its support. Keep evidence, teaching sequence and scene presentation separate.

## Claims

A claim has `id`, `text`, `status`, `basis`, `evidence_ids` and optional `uncertainty`. Its two dimensions are independent:

| Field | Values |
| --- | --- |
| `status` | `implemented`, `planned`, `hypothetical`, `unknown`, `general` |
| `basis` | `source`, `documentation`, `observation`, `inference`, `general_knowledge` |

Implemented behavior can still be an inference. Mark it as such in both data and explanation. An `unknown` claim requires the missing information in `uncertainty`. General prerequisites can use `general` with `general_knowledge`; repository-specific statements need their own support. Planned and hypothetical relationships must remain visibly different from implemented ones. Use no uncalibrated confidence percentages.

Cite supporting claim IDs from factual beats, entities and relationships. Label inferred rationale rather than inventing author intent. A passing test supports its observed conditions, not all possible executions; a source test that has not been run is source evidence, not an observation.

## Evidence selectors

Source evidence is `{"kind":"source","id":"reload","path":"src/store.rs","selector":{...}}`, with optional evidence-level `impl_range: {"start":10,"end":80}`. Paths are workspace-relative and confined before reads. Selectors are tagged:

| Selector `kind` | Payload |
| --- | --- |
| `item` | `path`, optional `item_kind` (`module`, `struct`, `enum`, `trait`, `function`, `type`, `const`, `static`, `union`, `macro`) |
| `inherent_method` | `owner`, `method` |
| `trait_method` | `owner`, `trait_path`, `method` |
| `range` | Inclusive one-based `start`, `end`, and `reason` explaining why a supported symbol selector is insufficient |

An ambiguous match is an error, never a first-match selection. Disambiguate generic or repeated implementations with the explicit impl range. Associated items must match the correct owner and kind. This is syntax-based Rust grounding, not rust-analyzer, cross-crate call resolution or execution. For unsupported macro/cfg/alias resolution, state the limitation and use a justified explicit range without claiming semantic resolution.

Document evidence uses `kind: "document"`, `id`, `path`, `locator` and `excerpt`. Keep the supporting passage exact and its locator meaningful; the local file is captured alongside the authored reference. Authors supply selectors and claims, not computed source hashes or resolved excerpts.

## Snapshot and staleness

Grounding computes source excerpts, inclusive line ranges, whole-file SHA-256 and excerpt hashes. The manifest records referenced paths/hashes and tracking state, plus repository remote, commit and dirty state when available. Untracked inputs remain labeled. A clean tree is not required. Referenced bytes are fingerprinted around grounding; a changing snapshot fails rather than mixing versions.

The bundle revision is a canonical lesson-plus-source-manifest SHA-256, not an author counter. Media and player build metadata are separate from semantic identity. Immutable bundles retain source evidence and verify asset hashes on loading, so a saved lesson remains readable without the repository.

When opening with a workspace, freshness compares files as `unchanged`, `stale` or `missing`. Stale evidence can still be viewed as the saved snapshot. To claim the lesson describes the current checkout, re-ground, review changed claims and save a new revision. If freshness cannot be checked, retain the saved-snapshot qualification. Pin any repository links to the captured commit; dirty-only evidence is not committed code.

## Observations and walkthrough provenance

Observation evidence records an already captured run with `kind: "observation"`, `id`, exact `argv`, workspace-relative `cwd`, `source_fingerprint`, `fixture_ids`, `configuration_ids`, `exit_status`, `event_source`, `expected`, `observed` and sanitized `output`. Obtain observations through existing authorized command tools. Store only relevant output, omitting secrets and unrelated logs. The player and preflight never execute these commands or verify a claimed run by executing it.

An authored path is a **source-derived walkthrough**: `walkthrough: {"kind":"source_derived","claim_ids":[...]}`. A captured path is an **observed run**: `walkthrough: {"kind":"observed_run","evidence_id":"captured-run"}`. Use the latter only with actual observation provenance. Preserve assumptions and scheduling uncertainty; do not turn partial async ordering into an invented total order. A trait relationship alone cannot prove which implementation ran.

If an inference combines source facts, cite those facts and say what is inferred. If a changed-code scenario has not been run, mark it hypothetical even when its predicted outcome seems obvious. Choice grading, learner self-assessment, OMP assessment and observed mechanical results remain distinct evidence.
