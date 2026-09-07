# /pr-evidence

Capture and attach evidence to a GitHub PR that the change was manually tested: the changed behaviour exercised for real and captured, as a terminal capture of a backend change driven end to end, a screenshot or recording of the UI it affects, before/after images. A screenshot of a passing test run is not evidence. Use whenever Jacob asks to test a change manually, gather or attach proof, take a screenshot or recording for a PR, or when a PR description needs an image. GitHub's API cannot attach files, so images go to Jacob's public R2 bucket via `r2-upload` and the PR embeds the URL. Covers what to capture, how to capture it credibly, upload, embedding, and what must never be uploaded.

# PR evidence

Evidence means proof that the change was manually tested: the new behaviour driven by hand against a running system and captured while it happens. A screenshot of a green test run, a coverage number, a CI badge or a lint pass is not evidence; the reviewer can see those on the PR already. If the capture does not show the changed behaviour actually happening, it is not done.

Prove the changed path, capture the proof raw, upload it, embed it. The evidence should let a reviewer verify the claim without trusting a narrated summary.

## What to capture
- Backend change: the real request against the public boundary plus the live logs of every changed service, as one terminal capture. If the change alters something a user sees, also capture that screen after the change; a backend PR often needs both.
- Frontend change: the affected screen, before and after when the diff is visual. A recording (mp4 or gif) when the evidence is an interaction, a screenshot otherwise.
- One image per claim in the PR. Cropped to what matters, large enough to read.

## Terminal captures
Jacob's terminal stack is Ghostty, fish, and tmux. Use it as-is: create dedicated windows/panes instead of opening another terminal or injecting into the active pane. One native Ghostty screenshot with the literal command and response in one pane and each live service log in its own pane. Keep it raw: prompts, pane borders, wrapping and log noise are the provenance. No styled reports, cards, slides or added headings.

Exercise the public boundary when one exists, not only the downstream RPC or a unit test. Record method, URL, non-secret headers, body, status, response, and the matching method/error lines from every changed service; use a request id when the stack has one. Read the ticket first: an intentional stub error can be the correct result.

## UI captures
Use the browser tools when they are connected (screenshot with `save_to_disk`, `gif_creator` for a flow), otherwise a native screenshot. Reuse the running dev stack and the repo's token/config tooling; don't launch a second copy. Inspect the saved file before uploading: a blank, truncated or wrong-state capture is worse than none.

## Upload and embed
1. Save captures outside every repository (`/tmp` or the scratchpad). Worktrees stay clean of evidence assets; never add an image to the feature branch.
2. `r2-upload /path/a.png /path/b.mp4` prints one public URL per file, in order.
3. In the PR body: `![settings page after the fix](URL)`. Before/after is two images on consecutive lines. A video URL goes on its own line as a plain link; GitHub does not inline external video.
4. Editing a PR is a remote mutation and needs Jacob's approval in the current turn, same as `gh pr create`. The upload itself needs none.

## Never upload
Everything in the bucket is world-readable with no expiry. Nothing showing a token, cookie, password, private key, customer data, or an internal hostname you would not paste into a public issue. Redact before capture, not after upload: an object is public the moment the command returns. Put a dev token in an env var and show the command referencing the variable; clear it from shell history and setup output before capturing.

## Cleanup
Stop only the dev services started for this run, close only the evidence windows/panes, remove temporary logs containing tokens, verify the worktrees are unchanged. Report the tested route/result, the file paths, the URLs, whether the PR was edited, and any expected failure or environmental caveat.

## Setup on a new machine
Only Jacob's credentials can write to the bucket. They live in `~/.config/r2/env`, mode 0600, one copy per machine, never in dotfiles or the harness repo:

```
R2_ACCOUNT_ID=…
R2_BUCKET=jacob-pr-evidence
R2_PUBLIC_BASE=https://evidence.jacobdevelops.com
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
```

`r2-upload --check` verifies the file and lists the bucket without uploading. The script needs only bash and curl 7.76+ (`--aws-sigv4`), so it runs unchanged on linux and macOS; `numen sync` links it into `~/.local/bin`. A 403 on `--check` means the token was revoked or is scoped to another bucket: ask Jacob rather than trying other credentials.
