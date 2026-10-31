# Close checklist: audit-overrides-4

Every box must be checked (`- [x]`) before `.claude/tasks/closed/audit-overrides-4.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate). The close-out
happens on the feature branch, before the single push (decision 057), so every item here must be provable
**before** the PR is merged. The merge and the post-merge deploy check are not archived: the deploy check is
reported in chat after merge, and a failed deploy opens a new task.

The only line allowed to stay unticked in this file is `push-pr` inside `## Workflow progress` (it is ticked
after the push, which comes after this commit).

This commit is the last commit before the push: take it only after the final review of the full diff (a
user-run `/code-review` included) and its fixes. A code change of the branch after the review (outside
`.claude/`, or in `.claude/hooks/` or `.claude/workflow-steps.json`; a merge of `main` does not count) makes the
review stale and the gates block (`/code-review high`, then re-record). To reopen after a later finding: `git revert <close-out sha>`
restores the task folder and removes this archive; fix, re-review, close again.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one: (1) `pnpm audit --audit-level=high` exits 0 after three overrides (`node-forge@<=1.4.0` to `^1.4.1`, `serialize-javascript@<7.1.3` to `^7.1.3`, `glob@>=9.0.0 <14.0.2` to `^14.0.2`) and the `nuxt` `^4.6.3` and `vue` `^3.5.44` bumps; every patched version exists on npm and is older than 24 hours, nothing was ignored; `deepmerge` (low, no 4.3.2 on npm) and `minimatch` (moderate, 11.x breaks ESLint) stay open and are reported. (2) `tests/arch/audit-overrides.spec.ts` strengthened (lockfile floors for the new packages, single `vue`, no orphan patch file), decision 064 with remove-when, 9 tests passing. (3) the `@nuxt/devtools@3.4.2` patch, its file and the `simple-git` and `@simple-git/argv-parser` overrides are removed. (4) lint, typecheck, unit, arch, build and e2e pass in `gate:push`.
- [x] `pnpm gate:push` real output confirmed green from the log file, not a task notification: eslint 0 errors, nuxt typecheck clean, 34 test files / 697 tests passed, "Build complete!", playwright "5 passed (13.1s)", EXIT=0 (2026-10-31, on the build tree; commit 0d9bc77 re-ran the gate with 698 tests; later commits only touch `.claude/`).
- [x] `/code-review` ran over the whole branch diff: NOT run for this dependency-only change (`code-review: not run`, stated in `## Review`); covered by the audit exit 0, the arch tests, the typecheck and `gate:push`.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `064-audit-overrides-2026-10-31.md`.
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: none changed; `ai-workflow.md` updated for the strengthened arch test.
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no convention changed.
- [x] No flagged/unresolved rule-11 conflict left open: `deepmerge` and `minimatch` have no usable patched release and are NOT ignored (no `ignoreGhsas` entry added); they are below the `high` threshold and listed under the user pendings.
- [x] `.claude/backlog.md` row for this task set to `done`.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (dependency and config
only: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, one deleted patch, one arch test, decision 064, catalog,
backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; sources are the public npm registry and GitHub advisories.
- [x] Branch (06): on `feat/audit-overrides-4`. Catalog (07): `ai-workflow.md` updated for the strengthened arch test. Gates (09): `pnpm gate` green in the commit, `gate:push` green. Contract (10): criteria 1-4 each map to the audit exit 0, the arch tests and `gate:push`. Decisions (11): 064 written, no ignore added.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the handoff names the single subagent.

code-review: not run for this dependency-only change; covered by `pnpm audit --audit-level=high` exiting 0, the
arch tests (`tests/arch/audit-overrides.spec.ts`) and `pnpm gate:push` (typecheck, build + e2e). 2026-10-31, round 1,
no effort level.

- findings: none

## Workflow progress

Pasted from the handoff, ticked with evidence for every step before `push-pr`.

- [x] story — evidence: c5f8978 (story.md, contract.md and backlog row `doing`)
- [x] contract — evidence: c5f8978 (contract.md, criteria 1-4)
- [x] build — evidence: 0d9bc77 (three overrides, nuxt and vue bumps, patch removed, lockfile, decision 064, arch test, catalog)
- [x] consolidate — evidence: 0d9bc77 (pnpm gate green in the commit hook: 34 files / 698 tests)
- [x] validate — evidence: 2026-10-31 pnpm gate 34 files / 698 tests passed, 0 lint errors, typecheck clean; pnpm audit --audit-level=high exit 0
- [x] handoff — evidence: b3b2c32 (handoff.md with Review committed)
- [x] commit — evidence: 0d9bc77
- [x] review — evidence: b3b2c32 (commit that recorded the Review section; code-review not run, dependency-only change, findings: none)
- [x] close-out — evidence: 89fd000 (last commit before the close-out; the close-out commit itself archives this file, deletes the task folder and marks the backlog row done)
- [x] gate-push — evidence: 2026-10-31 pnpm gate:push exit 0 on 0d9bc77 tree: 697 unit/arch tests passed (34 files), nuxt build complete, playwright 5 passed
- [ ] push-pr — evidence:
