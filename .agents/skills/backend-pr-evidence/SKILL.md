---
name: backend-pr-evidence
description: Manually test backend changes and capture credible PR evidence from the real request and live service logs. Use when Jacob asks to exercise a local API, gather evidence, take a backend screenshot, or attach proof to a PR. Do not use for UI acceptance screenshots.
generated-by: numen-sync
---

# Backend PR evidence

Prove the changed path end to end, then capture the proof as raw terminal output. The evidence should let a reviewer correlate the client request with each changed backend boundary without trusting a narrated summary.

## Build the test around the change

- Read the ticket/spec and identify the observable result expected at the current implementation stage. An intentional stub error can be the correct result.
- Find the project's supported local runtime and data stack before launching anything. Reuse running infrastructure and repo-provided token/config tooling.
- Exercise the public boundary when one exists, not only the downstream RPC or a unit test.
- Record the exact method, URL, non-secret headers, request body, status, response, and the corresponding method/error lines from every changed service.
- Use a request id when the stack provides one. Otherwise keep the request unique enough to correlate by route, ref, and timestamp.

## Capture real terminal evidence

Jacob's terminal stack is Ghostty, fish, and tmux. Use it as-is. Ghostty auto-attaches to tmux, so create dedicated windows/panes instead of opening Terminal.app or injecting commands into the active Codex pane.

Prefer one native Ghostty screenshot with:

- the literal curl command and response in one pane;
- the live upstream service log in another pane;
- the live downstream service log in another pane.

Keep it raw. Do not turn the result into a styled report, evidence card, synthetic webpage, slide, or explanatory dashboard. Normal prompts, pane borders, wrapping, and service logs are desirable because they make the provenance obvious. Avoid added headings or prose beyond what the commands naturally print.

Never expose credentials. Put a development token or secret in an environment variable and show the command referencing the variable. Redact the value before capture, including shell history or setup output.

Make the panes large enough that the full route, response, method names, and error are readable. Visually inspect the saved PNG before using it.

## Keep evidence out of feature diffs

Save screenshots outside every repository unless Jacob explicitly asks otherwise. Confirm each worktree remains clean of evidence assets.

If an image must render in a private GitHub PR, use the available private-repo PR image skill/workflow and a dedicated assets branch. Do not add the image to the feature branch. Creating or updating a remote assets branch and editing a PR are remote mutations, so require Jacob's explicit approval in the current turn.

## Cleanup

Track the processes and tmux windows created for the test. After capture:

- stop only the dev services started for this evidence run;
- close only the dedicated evidence windows/panes;
- leave shared infrastructure and Jacob's existing tmux windows alone;
- remove temporary logs containing tokens;
- verify the relevant worktrees are unchanged.

Report the tested route/result, screenshot path, whether the image was attached, and any expected failure or environmental caveat.
