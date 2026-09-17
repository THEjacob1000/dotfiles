# /pr-evidence

Capture and attach manual testing evidence to GitHub PR descriptions using isolated terminals and headless browsers. Use when asked to test a change manually, gather proof, capture a screenshot or recording for a PR, or add evidence to a PR. Covers real request and service-log captures, public R2 uploads, and embedding in the relevant PR section.

# PR evidence

Evidence means proof that the change was manually tested: the new behaviour driven by hand against a running system and captured while it happens. A screenshot of a green test run, a coverage number, a CI badge or a lint pass is not evidence; the reviewer can see those on the PR already. If the capture does not show the changed behaviour actually happening, it is not done.

Prove the changed path, capture the proof raw, upload it, embed it. The evidence should let a reviewer verify the claim without trusting a narrated summary.

## What to capture
- Backend change: the real request against the public boundary plus the live logs of every changed service, as one terminal capture. If the change alters something a user sees, also capture that screen after the change; a backend PR often needs both.
- Frontend change: the affected screen, before and after when the diff is visual. A recording (mp4 or gif) when the evidence is an interaction, a screenshot otherwise.
- One image per claim in the PR. Cropped to what matters, large enough to read.

## Terminal captures
Capture offscreen by default. Use an agent-owned PTY or a detached tmux server on a unique socket (`tmux -L pr-evidence-<run>`), never Jacob's existing server. Keep the request and each live service log in separate panes. Do not attach a client to his terminal, select his windows, activate applications, resize or zoom his terminal, send desktop keystrokes, or capture his monitor without an explicit request to use his display.

Save the real terminal output or recording, then render it offscreen to an image or video. For a static capture, `capture-pane -p` on the isolated server gives the terminal's actual text; render that verbatim with a monospace font in an agent-owned headless browser. Keep the raw transcript alongside the image. Identify it as a rendered terminal capture, not a native screenshot. Preserve literal commands, responses, wrapping and log output; no reconstructed output, invented prompts, styled reports or summary cards. Redact secrets before recording.

Exercise the public boundary when one exists, not only the downstream RPC or a unit test. Record method, URL, non-secret headers, body, status, response, and the matching method/error lines from every changed service; use a request id when the stack has one. Read the ticket first: an intentional stub error can be the correct result.

## UI captures
Use an agent-owned headless browser/context for screenshots and recordings. Reuse the running dev stack and the repo's token/config tooling; don't launch a second copy of the app. Do not drive Jacob's active browser or fall back to his monitor when headless capture is unavailable; report the specific capture limitation. Inspect the saved file before uploading: a blank, truncated or wrong-state capture is worse than none.

## Upload and embed
1. Save captures outside every repository (`/tmp` or the scratchpad). Worktrees stay clean of evidence assets; never add an image to the feature branch.
2. `r2-upload /path/a.png /path/b.mp4` prints one public URL per file, in order.
3. Embed in the PR body's existing Screenshots / Videos or evidence section: `![settings page after the fix](URL)`, with the actual test scope and any simulation caveat. Before/after is two images on consecutive lines. A video URL goes on its own line as a plain link; GitHub does not inline external video. When attachment is authorized, finish by editing the description and reading it back to verify the embed, not just returning an upload link.
4. Editing a PR is a remote mutation and needs Jacob's approval in the current turn, same as `gh pr create`. The upload itself needs none.

## Never upload
Everything in the bucket is world-readable with no expiry. Nothing showing a token, cookie, password, private key, customer data, or an internal hostname you would not paste into a public issue. Redact before capture, not after upload: an object is public the moment the command returns. Put a dev token in an env var and show the command referencing the variable; clear it from shell history and setup output before capturing.

## Cleanup
Stop only the dev services started for this run, destroy only the agent-owned tmux server/browser, remove temporary logs containing tokens, verify the worktrees are unchanged. Never kill or reconfigure Jacob's shared tmux server. Report the tested route/result, the file paths, the URLs, whether the PR was edited, and any expected failure or environmental caveat.

## Setup on a new machine
Only Jacob's credentials can write to the bucket. They live in `~/.config/r2/env`, mode 0600, one copy per machine, never in dotfiles or the harness repo:

```
R2_ACCOUNT_ID=…
R2_BUCKET=jacob-pr-evidence
R2_PUBLIC_BASE=https://evidence.jacobdevelops.com
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
```

`r2-upload --check` verifies the file and lists the bucket without uploading. The script needs only bash and curl 7.76+ (`--aws-sigv4`), so it runs unchanged on linux and macOS; `numen sync` copies it into the dotfiles Stow tree, which exposes it at `~/.local/bin` on each machine. A 403 on `--check` means the token was revoked or is scoped to another bucket: ask Jacob rather than trying other credentials.
