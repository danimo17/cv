# 09 · Binding gates

**What.** `pnpm gate` (format:check, lint, typecheck, unit+arch) must be green before every commit;
`pnpm gate:push` (gate + build + e2e) before every push; CI (gate + build + e2e + security) green before
every merge to `main`; production deploy only comes from `main` and only if CI is green there. Never
`--no-verify` or `git commit -n` (also as a cluster such as `-nm`; `git push -n` is a dry run). A test that's bothersome gets fixed or justified in the contract, not skipped.

The workflow is one list of steps (`.claude/workflow-steps.json`, decision 057): everything up to the push
happens on the `feat/<slug>` branch, in this order: review, close-out (archive + task folder deletion, still
the same branch), `gate:push`, then the **single** push and PR. Pushing a `feat/<slug>` branch (push-review-gate,
decisions 054 and 057) requires, in the committed tree (`HEAD`, never the working tree): a `## Review` section
with zero unchecked boxes that mentions `code-review`, and a `## Workflow progress` block with every `pre-push`
step before `push-pr` ticked with evidence (a real commit sha for `commit`, `review` and `close-out`). The
slug is the destination `feat/<slug>` branch name; `.claude/tasks/ACTIVE` plays no part, so any number of
`feat/*` branches can work in parallel. The gate reads `.claude/tasks/<slug>/handoff.md` from the tip commit of
the pushed ref, or `.claude/tasks/closed/<slug>.md` when the task was closed on the branch. It is the same
script (`.claude/hooks/require-contract.py`) wherever the push or commit comes from: Claude's hook (which
follows the pushed refspec), `.githooks/pre-commit` and `.githooks/pre-push` (any git client), and the
`workflow-gate` job of `ci.yml` on every `feat/*` pull request; on a pull request CI runs the **base branch's**
copy of the script and step list (`--base origin/<base>`) when that copy supports `--ci` and `--base`, so a PR cannot weaken
its own gate (the PR that introduces the gate falls back to its own copy and prints a notice). Hard block, no
escape hatch.

A review is only good for the code it saw. The `review` evidence must be the sha of a commit on the pushed
branch that recorded the review: one whose diff changed the content of the `## Review` section of the task's
`handoff.md` or `closed/<slug>.md` (a progress tick or a Pending edit does not count). If the branch's own
diff against its base ref (`--base` in CI, else `origin/main`, else `main`) changes after that commit in any
path outside `.claude/`, in `.claude/hooks/` or in `.claude/workflow-steps.json` (the gate itself counts as
code), the review is **stale** and the push (and the closing commit) is blocked with the sha, the path, the
first later commit and the command to run: `/code-review high`, then re-record the result and the evidence.
A merge of `main` into the branch after the review does not stale it: the comparison is of the branch's own
changes (three-dot diff), so only what main brings is ignored. For the same reason the close-out is the last commit before the push, taken only after the final
review of the full diff (a user-run `/code-review` included) and its fixes. If a later review finds something
after the close-out, reopen with `git revert <close-out sha>` (the folder comes back, the archive goes), fix,
re-review and close again. Evidence shas are tied to their step: `commit` and `close-out` must be ancestors of
the tip, `review` an ancestor that recorded the review. Unchecked-box scans only count real list items
(`-`, `*`, `+`, `1.` or `1)` followed by `[ ]`) outside fenced code blocks, never prose. The Claude hook also
refuses a `core.hooksPath` override on `git commit`/`push` (`-c core.hooksPath=...`, `--config-env`, a chained `git config ... core.hooksPath`, `GIT_CONFIG_KEY_<n>=core.hooksPath`) exactly like
`--no-verify`, since it switches the git hooks off. In CI the base copy of the gate is only used when it
supports both `--ci` and `--base`; otherwise the PR's own copy runs with a notice. Merge, rebase, cherry-pick and revert commits are not
blocked by the docs-only rule of rule 10 (their other checks stay).

**A finding becomes a test (review policy, decision 057 third amendment; see `workflow.md` `## Review policy`).**
Enforced by the same script, not by memory (rule 19). (1) Once the `review` step is ticked (handoff or archive at
`HEAD`), a commit that stages code (outside `.claude/`, plus `.claude/hooks/` and `.claude/workflow-steps.json`;
`tests/` and `e2e/` are not code) must also stage a file under `tests/` or `e2e/`; merge, rebase, cherry-pick,
revert and closing commits are exempt. (2) For freshness a later code commit that also changes a test file is a
fix with its test and does not stale the review; one without a test does. (3) Every `## Review` finding is a line
`- finding <id> — outcome: <fixed|queued|no_change_needed> — proof: <text>` checked at push (every caller) and at
close: `fixed` is `strengthened <tests/file> › <test name>` (the test exists at the base ref and its file differs
from the base) or `new <tests/file> › <test name> — searched: <terms>` (not at the base, and the gate performs the
search itself: another matching test/describe/it title blocks unless the line adds `— differs: <reason>`);
`queued` names a backlog slug, an open task folder or an archive; `no_change_needed` gives the reason; no finding
line needs `findings: none`. Search first: strengthen an existing test, create a new one only when none exists;
titles are unique per file (`tests/arch/no-duplicate-test-titles.spec.ts`). The test is the verification, not a
second review; at most two review rounds per task, the second only the delta. Honest limit: a test proves that bug
cannot return, not that the fix adds none elsewhere (suite, `gate:push` and CI are the net); duplicate detection is
by titles and search terms, not semantic.

The post-merge `deploy-check` (decision 042, relaxed by 057) is **non-blocking**: after the user merges, the AI
runs `gh run list --branch main --workflow deploy.yml` and reports the result in chat. A failed deploy is fixed
in a new task/commit, never by reopening a closed task.

**Why.** "I tested it" is not evidence; the gate is. Same logic extends to "I reviewed it" (decision 054,
rule 19): a workflow step enforced only by the AI remembering to follow it is not enforced. The deploy check
moved out of the blocking path because the facts it verifies (merge, deploy) cannot exist before the merge,
which forced a second close-only PR per task.

**How it's checked.** `.githooks/pre-commit`, `.githooks/pre-push` (enabled by `pnpm install` → `prepare`
script), workflows in `.github/workflows/`, `main` ruleset with required checks, and the Claude hook
`.claude/hooks/require-contract.sh` that blocks `--no-verify`, a commit that ticks a progress step without
valid evidence, and (on push) a missing review or an incomplete progress block; the git hooks and the CI job
call the same script (`tests/arch/workflow-steps.spec.ts` checks the wiring). `tests/arch/require-contract-hook.spec.ts`
runs the real hook against throwaway git repos; `tests/arch/workflow-steps.spec.ts` keeps `workflow.md`, the handoff template and the Gates table in sync with `workflow-steps.json`.
