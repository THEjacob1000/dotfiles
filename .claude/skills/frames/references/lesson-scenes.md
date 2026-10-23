# Lesson scenes

Scenes present an authored explanation; they do not simulate arbitrary repository code. Use shared entity IDs across scenes and scenarios. The runtime generates layout once and persists it with the bundle, so inspection and expansion preserve surrounding spatial context.

## Three primitives

| `kind` | Use | Authored structure |
| --- | --- | --- |
| `boundary_map` | Responsibilities and interfaces | `id`, `entity_ids`, `relationships`; entity `parent_id` supplies nesting |
| `sequence` | Calls, async waits and transaction boundaries | Common scene fields plus `lanes`, `messages`, `walkthrough` |
| `state_machine` | Legal transitions and invariants | Common scene fields plus `states`, `transitions` |

Sequence messages contain `id`, `source`, `destination`, `label`, `kind` (`call`, `return`, `message`, `wait`), `claim_ids`, optional `after_message_ids` and `uncertainty`. Lanes reference scene entities. Declare only known ordering; a local wait uses the same source and destination. Label the sequence `source_derived` with `claim_ids`, or `observed_run` with its observation `evidence_id`. Scenarios also declare their walkthrough provenance and assumptions.

Machine states contain `id`, `entity_id`, `label` and `values` (`property`, `value`). Transitions name `from_state_id`, `to_state_id`, `label`, `condition`, `before`, `after` and `claim_ids`. Conditions are explanatory text, not executable expressions.

Relationships contain `id`, `from`, `to`, `kind`, `label`, `status`, `claim_ids` and `evidence_ids`. Kinds are `depends_on`, `calls`, `sends`, `owns`, `implements`, `persists`. Keep their semantics distinct: a dependency is not a runtime call, and implementing a trait does not select a runtime implementation. Planned and hypothetical edges retain visible labels rather than appearing as implemented architecture.

## Actions and payloads

Every action has `kind`, existing scene entity `targets`, beat-relative `offset_ms`, `duration_ms`, and optional `illustrative` (default false). Set `illustrative: true` for unverified illustrative values or ordering; support factual explanations with claims independently.

| Kind | Additional payload | Meaning |
| --- | --- | --- |
| `show`, `hide` | None | Change entity visibility |
| `focus` | None | Emphasize targets without changing architecture |
| `annotate` | `text` | Attach a readable explanation |
| `set_state` | `property`, `before`, `after` | Depict a reversible property change |
| `transfer` | `source`, `destination`, `token_label` | Move a labeled value between entities |
| `call`, `return` | `source`, `destination`, `label` | Depict the authored operation/result |
| `wait` | `reason` | Show the condition or scheduling uncertainty |
| `acquire`, `release` | `resource`, `transaction` | Show resource ownership within the named transaction |
| `commit`, `rollback` | `transaction` | Depict that transaction's outcome |

For example:

```json
{"kind":"set_state","targets":["sale"],"offset_ms":1200,"duration_ms":600,"property":"status","before":"AwaitingAcceptance","after":"Rejected","illustrative":true}
```

Names in payloads must resolve, not merely appear in a label. Use `set_state` for the values to explain, and a transaction action for the transaction outcome; neither executes database work.

## Timing and deterministic state

A beat contains stable `id`, `narration`, `claim_ids`, ordered `actions`, optional `hold_ms` and optional `duration_ms`. Cue offsets start at that beat's audio start, not a fraction of the whole step. Fit action endpoints within measured narration plus the explicit end hold. Audio preparation can diagnose cues that overrun synthesized narration; preflight cannot measure speech it does not synthesize.

`hold_ms` adds static reading/thinking time after narration. `duration_ms` supplies explicit transcript-only autoplay timing, not fabricated speech timing. Without usable audio or an authored duration, use transcript/manual stepping. Pause stops the logical clock; speed changes narration and motion together.

The reducer reconstructs state from the scene and ordered actions at a logical step/beat/offset. Seek backward, replay or change scenarios by reconstructing state, including commit/rollback depictions, rather than accumulating animation side effects. Author no random positions, wall-clock state or arbitrary JavaScript. Validation rejects overlapping writes to the same property; array order is not a workaround for conflicting actions. Simultaneous independent actions can use explicit array order.

Use static holds when nothing semantically changes. Reduced motion replaces movement with labeled state changes, preserving the explanation. Reinforce color with text or shape, keep labels/transcript readable independently, and retain meaningful entity labels for keyboard and assistive-technology inspection. Inspection pauses and bookmarks the guided path; pan, zoom and expansion do not edit the authored timeline.
