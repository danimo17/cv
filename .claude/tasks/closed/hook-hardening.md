# Close checklist: hook-hardening

Closed on the feature branch `feat/hook-hardening` before the single push (decision 057), on 2026-10-19, as the last
commit of the branch. Verified on the tree of `fb88525` (the last commit before this one; the last code commits are
`aee7c5e` and `afbba9e`, each with its tests in `tests/arch/require-contract-hook.spec.ts`, and `f2e2e49` for the documentation test in `tests/arch/workflow-steps.spec.ts`; every
commit after them only touches `.claude/`). The review (`0484507`) is the high-effort `/code-review` round of
2026-10-19 and is not stale: no code changed after it. The merge and the post-merge deploy check are not archived: the
deploy check is reported in chat after merge. The only open line is `push-pr`.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (6 criteria). The pre-commit `pnpm gate`
      of `fb88525` printed `Test Files  26 passed (26)`, `Tests  636 passed (636)`; the criteria and the test that
      proves each:
  - [x] 1. `tests/arch/require-contract-hook.spec.ts` › "hook resolves the repo from the payload cwd", "a git worktree of the same repository is evaluated on its own branch, not on CLAUDE_PROJECT_DIR", "a cwd inside an unrelated repository is not this project and the hook allows the command" and "git -C and cd directories select the repository the command acts on"
  - [x] 2. `tests/arch/require-contract-hook.spec.ts` › "new feat branch is blocked by orphaned unmerged branches, not by parallel doing tasks" (and its variants, "every branch-creating form of checkout, switch and branch is recognised", "branch creation is checked in the repository selected by the payload cwd, -C and cd")
  - [x] 3. `tests/arch/require-contract-hook.spec.ts` › "multi-file code commits need a subagent row in the handoff" (and "a rename counts as one file, and css, i18n and data paths are not code")
  - [x] 4. `tests/arch/require-contract-hook.spec.ts` › "structural config changes need a decision record" (and "only a decision that mentions the changed file or its directory satisfies rule 11")
  - [x] 5. `tests/arch/require-contract-hook.spec.ts` › "shared component changes need a consumers section in the contract"
  - [x] 6. `tests/arch/workflow-steps.spec.ts` › "decision 059 and the hardening rules are documented" and "the code-review round of decision 059 is documented in the rules, catalog, standards and templates"
- [x] `pnpm gate:push` real output confirmed green, the actual log read (not a notification's exit code), run on
      `0484507` on 2026-10-19: `EXIT=0`, eslint 0 errors (1 pre-existing warning), `Test Files  26 passed (26)`,
      `Tests  636 passed (636)`, nuxt build `Build complete!`, playwright `5 passed (12.5s)`. The close-out only
      touches `.claude/`, so that run stays valid for this commit.
- [x] `/code-review` ran over the whole branch diff: high effort, 2026-10-19, round 1, a read-only reviewer agent at the
      user's request, 9 findings recorded in `## Review` below (fixed with a test, F10d queued)
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `059-hook-hardening.md`
      with its 2026-10-19 amendment
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: no
      component, store or composable changed; `ai-workflow.md` has the updated require-contract row, the "Hook
      hardening (decision 059)" table and the "Test isolation" section
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: `testing.md` documents the
      `GIT_*` isolation of `tests/setup/clean-git-env.ts`
- [x] No flagged/unresolved rule-11 conflict left open (handoff "Pending on the user": only the push and PR decision,
      which is `push-pr`)
- [x] `.claude/backlog.md` rows `hook-hardening` and `require-contract-decision-check` set to `done`

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff, items that do not apply to a hook, spec and docs diff marked n/a:

- [x] Secrets (01): no key in the diff; n/a beyond that
- [x] Company (02): no company code or resources; sources declared none in the contract
- [x] Giphy boundary (03): n/a, untouched
- [x] PII (04): no phone or address in the diff
- [x] i18n (05): n/a, no user-facing strings
- [x] Branch (06): work is on `feat/hook-hardening`, nothing pushed
- [x] Catalog (07): the catalog rows for the hook, hook hardening and test isolation were updated in the same change (f2e2e49)
- [x] CSS (08): n/a, no component
- [x] Gates (09): `pnpm gate` green on every commit (output in Validation); `pnpm gate:push` run before the push
- [x] Contract (10): criteria 1-6 each have a named test; the review round adds tests per finding
- [x] Decisions (11): decision 059 amendment 2026-10-19 records every change; the structural commits stage or carry a decision that mentions the files
- [x] Primitives (026, 038): n/a, no template
- [x] Living docs (027): the catalog was consulted before changing anything
- [x] Subagents (12): the Subagents table states who did what
- [x] Accessibility: n/a
- [x] UI pattern consistency (16): n/a, no UI; the contract template gained the real consumers section the hook checks

`/code-review` result: high effort, 2026-10-19, round 1, run by a read-only reviewer agent at the user's request, 9 findings (the numbering below follows the request; its item 10, evasion and fail-open, is recorded as F10a-F10d). Every finding is a line below with its outcome and proof; the tests are in `tests/arch/require-contract-hook.spec.ts` unless the proof names another file.

- finding F1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › git -C and cd directories select the repository the command acts on — searched: git -C and cd directories
- finding F1b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › branch creation is checked in the repository selected by the payload cwd, -C and cd — searched: selected by the payload cwd
- finding F2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a cwd inside an unrelated repository is not this project and the hook allows the command — searched: unrelated repository
- finding F3 — outcome: fixed — proof: strengthened tests/arch/require-contract-hook.spec.ts › a change to the gate itself is code too
- finding F3b — outcome: fixed — proof: strengthened tests/arch/require-contract-hook.spec.ts › staging nuxt.config.ts or eslint.config.mjs without a decision file blocks
- finding F3c — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › only a decision that mentions the changed file or its directory satisfies rule 11 — searched: mentions the changed file
- finding F3d — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a decision added earlier on the branch satisfies rule 11 for later commits, one from the base does not — searched: added earlier on the branch
- finding F4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a rename counts as one file, and css, i18n and data paths are not code — searched: rename counts
- finding F5 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › heredoc bodies and quoted text are never taken for a git command — searched: never taken for a git command
- finding F5b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a heredoc or quoted text that mentions branch creation is not a branch creation — searched: mentions branch creation
- finding F6 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a commit check reads the branch and each merge marker once — searched: each merge marker once
- finding F7 — outcome: fixed — proof: strengthened tests/arch/require-contract-hook.spec.ts › queued: a backlog slug, an open task folder or a closed archive passes
- finding F7b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a doing row whose slug is written in backticks still marks a parallel task — searched: written in backticks
- finding F8 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › every branch-creating form of checkout, switch and branch is recognised — searched: every branch-creating form
- finding F9 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › the code-review round of decision 059 is documented in the rules, catalog, standards and templates — searched: code-review round
- finding F10a — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › the branch scan blocks when git cannot list the feat branches or no base branch exists — searched: cannot list the feat branches
- finding F10b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › rule 12 blocks when the staged diff cannot be read — searched: staged diff cannot be read
- finding F10c — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › rule 11 blocks when package.json cannot be read from the index or HEAD — searched: cannot be read from the index
- finding F10d — outcome: queued — proof: workflow-integrity-hardening item 9: branch creation through `checkout --orphan`, `switch --orphan`, `worktree add -b`, `branch -c`, wrappers (`sh -c`, `xargs`), the unaudited `ALLOW_UNMERGED_FEAT=1` prefix and the placeholder-row weakness of the rule 12 table; deliberate evasions, low severity

## Workflow progress

- [x] story — evidence: 535061c story.md (re-authored from the test identity)
- [x] contract — evidence: 535061c contract.md, criteria 1-6
- [x] build — evidence: edb3b66 hook, specs, decision 059, docs, backlog, vitest GIT\_\* isolation; review-round fixes aee7c5e, afbba9e, f2e2e49
- [x] consolidate — evidence: pre-commit pnpm gate of f2e2e49: 26 files, 636 tests passed, lint 0 errors
- [x] validate — evidence: 2026-10-19 full tests/arch/require-contract-hook.spec.ts green inside the gate (17 new tests red against the old hook first; review round: 15 tests observed red against the hook before the fix, in two batches of 5 and 10; the rename, comment and unterminated-quote cases were added after those red runs and were not run red on their own)
- [x] handoff — evidence: 2026-10-19 this file
- [x] commit — evidence: f2e2e49 last code and docs commit of the review round (535061c story and contract, edb3b66 build commit)
- [x] review — evidence: 0484507 (the commit that recorded the `## Review` section: high-effort `/code-review` of 2026-10-19 by a read-only reviewer agent, one line per finding with its proof; no code change after it)
- [x] close-out — evidence: 60b1b9d (close-workflow-redesign, the previous close made through this gate); this task's own close commit is the last commit of the branch and cannot cite itself, its archive is `.claude/tasks/closed/hook-hardening.md`
- [x] gate-push — evidence: pnpm gate:push on 0484507 (2026-10-19, real log read, EXIT=0): Test Files 26 passed (26), Tests 636 passed (636), nuxt build "Build complete!", e2e 5 passed (12.5s)
- [ ] push-pr — evidence:
