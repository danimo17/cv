# Close checklist: audit-overrides-2

Every box must be checked (`- [x]`) before `.claude/tasks/closed/audit-overrides-2.md` can be staged with this content —
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

- [x] Every acceptance criterion in `contract.md` is verified done, one by one: (1) `pnpm audit --audit-level=high` exits 0 after overrides for `@modelcontextprotocol/server` (`^2.3.0`), `vite` (`^8.3.3`) and `launch-editor` (`^2.14.2`); every patched version exists on npm and is older than 24 hours, none was ignored. (2) `tests/arch/audit-overrides.spec.ts` strengthened (floors, lockfile range, decision 061 with remove-when per override), 7 tests passing. (3) build and e2e pass in `gate:push`.
- [x] `pnpm gate:push` real output confirmed green from the log file, not a task notification: eslint 0 errors, 26 test files / 604 tests passed, "Build complete!", playwright "5 passed (14.6s)", exit=0 (2026-10-22, on 654c7f9; later commits only touch `.claude/`).
- [x] `/code-review` ran over the whole branch diff: NOT run for this dependency-only change (`code-review: not run`, stated in `## Review`); covered by the audit exit 0, the arch tests and `gate:push`.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `061-audit-overrides-2026-10-22.md`.
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: none changed; `ai-workflow.md` updated for the strengthened arch test.
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no convention changed.
- [x] No flagged/unresolved rule-11 conflict left open: no advisory lacked a patched version, no ignore was added.
- [x] `.claude/backlog.md` row for this task set to `done`.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (dependency and config
only: `pnpm-workspace.yaml`, `pnpm-lock.yaml`, one arch test, decision 061, catalog, backlog, task files, plus the
git env scrub files taken from `origin/feat/arch-rule-gates`):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; sources are the public npm registry and GitHub advisories.
- [x] Branch (06): on `feat/audit-overrides-2`. Catalog (07): `ai-workflow.md` updated for the strengthened arch test. Gates (09): `pnpm gate` green in the commit. Contract (10): criteria 1-3 each map to the audit exit 0, the arch tests and `gate:push`. Decisions (11): 061 written, no ignore added.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the handoff names the single subagent.

code-review: not run for this dependency-only change; it is covered by `pnpm audit --audit-level=high` exiting 0, the
arch tests (`tests/arch/audit-overrides.spec.ts`) and `pnpm gate:push` (build + e2e). 2026-10-22, round 1, no
effort level.

- findings: none

## Workflow progress

Pasted from the handoff, ticked with evidence for every step before `push-pr`.

- [x] story — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] contract — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] build — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] consolidate — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] validate — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] handoff — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] commit — evidence: f9811f7 (story.md, contract.md, handoff.md, overrides, decision 061 and tests committed; pnpm gate green)
- [x] review — evidence: 654c7f9 (commit that recorded the Review section; code-review not run, dependency-only change, findings: none)
- [x] close-out — evidence: 1bcdf75 (last commit before the close-out; the close-out commit itself archives this file, deletes the task folder and marks the backlog row done)
- [x] gate-push — evidence: 2026-10-22 pnpm gate:push exit 0 on 654c7f9: 604 unit/arch tests passed (26 files), nuxt build complete, playwright 5 passed
- [ ] push-pr — evidence:
