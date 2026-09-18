# 06 · The AI works on a branch

**What.** All AI work goes to `feat/<slug>` (slug = active task). Never commits, merges, rebases, resets or
pushes with `main` as the current or target branch. By default, the AI leaves the branch ready and it's the
user who does the push, PR and merge. **Exception (decision 031, 2026-09-14):** if the user explicitly asks
for it at that moment, the AI can `git push` a `feat/*` branch (never `main`) — the permission is for that
specific push, not a permanent blank check; it must be given again every time. Merging to `main` remains
always exclusive to the user, and GitHub only allows it with CI and security scans green (branch
protection).
**Why.** `main` is what deploys to production; human review is the final gate. The merge is irreversible from
a deployment standpoint, so it's never delegated; pushing a working branch is reversible (it can be deleted)
and so it can be delegated punctually with express permission.
**How it's checked.** The user's global Claude Code `git-safety` hook (blocks force-push and direct push to
`main`/`master`, but not push of a `feat/*` branch) + `main` ruleset on GitHub.
