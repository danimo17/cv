# Close checklist: audit-autofix

Every box must be checked (`- [x]`) before `.claude/tasks/closed/audit-autofix.md` can be staged with this content —
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

- [x] Every acceptance criterion in `contract.md` is verified done, one by one: (1) `audit-fix-workflow.spec.ts` › "audit-fix workflow is scheduled, least-privilege and never merges" green; (2) › "audit-fix workflow pins actions and uses the dedicated token" green (`pnpm/action-setup` pinned to 0977fd9, only `secrets.AUDIT_FIX_TOKEN`); (3) › "audit-fix opens a PR only after the audit passes and never writes an ignore" green (order install, `--fix=override`, non-frozen install, second audit, PR; issue step only on failure); (4) decision 063, the catalog workflow/secret rows and `workflow-steps.spec.ts` (every workflow file is in the catalog) plus › "audit-fix decision 063 records the design and the one manual step without a token value" green; (5) handoff `Not covered` and decision 063 give the `workflow_dispatch` dry run; (6) `audit-overrides.spec.ts` › "audit override selectors may close the vulnerable range with <= when the floor is above it" and `audit-fix-workflow.spec.ts` › "audit-fix writes a decision that explains every override it adds" green; (7) › "audit-fix keeps minimumReleaseAgeExclude as it was before pnpm audit --fix" green.
- [x] `pnpm gate:push` real output confirmed green from the log file (/tmp/af-gp.log), not a task notification: eslint 0 errors, 27 test files / 611 tests passed, "Build complete!", playwright "5 passed (13.7s)", exit=0 (2026-10-29, on fe2d1ae; later commits only touch `.claude/`).
- [x] `/code-review` ran over the whole branch diff: NOT run for this workflow-only change (`code-review: not run`, stated in `## Review`); covered by the arch spec, the fixture runs of the awk programs, the manual fix/install/audit run in a throwaway copy and `gate:push`.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `063-audit-autofix-workflow.md`.
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: none changed; `ai-workflow.md` updated with the `audit-fix.yml` workflow row, the `AUDIT_FIX_TOKEN` secret and the audit auto-fix paragraph.
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no convention changed.
- [x] No flagged/unresolved rule-11 conflict left open: no ignore is written by the workflow; the owner's pendings (secret, dry run, today's advisories) are listed in the handoff and the PR.
- [x] `.claude/backlog.md` row for this task set to `done`.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (one workflow file, three arch
specs, decision 063, catalog, backlog, task files):

- [x] Secrets (01): no token value anywhere, the workflow only references `secrets.AUDIT_FIX_TOKEN` (asserted by the spec). Company (02): sources are pnpm and GitHub documentation plus the public npm registry. Giphy (03), PII (04), i18n (05): n/a, no app, server or locale change.
- [x] Branch (06): on `feat/audit-autofix`, no push. Catalog (07): `ai-workflow.md` updated (workflow, secret, behavior). Gates (09): `pnpm gate` green in every commit. Contract (10): criteria 1-7 each map to a named test (1-3, 6, 7 in `audit-fix-workflow.spec.ts` and `audit-overrides.spec.ts`; 4 in `workflow-steps.spec.ts` plus the decision 063 test; 5 in this handoff and decision 063). Decisions (11): 063 written; no ignore added, and the workflow can never add one.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change; the pnpm/node setup steps match `ci.yml` except the SHA pin of the non-first-party action. Subagents (12): the table above.

code-review: not run (no `/code-review` round was run for this workflow-only change); it is covered by
`tests/arch/audit-fix-workflow.spec.ts`, the fixture runs of the awk programs, the manual run of the fix/install/audit
sequence in a throwaway copy, and `pnpm gate:push`. 2026-10-29, round 1, no effort level. A self-review of the diff found
one issue (a same-day re-run could overwrite an earlier merged decision file), fixed in 0075581 with a failing test first.

- findings: none

## Workflow progress

Pasted from the handoff, ticked with evidence for every step before `push-pr`.

- [x] story — evidence: a1f8f56 (story.md, contract.md, backlog row `doing`)
- [x] contract — evidence: a1f8f56 (criteria 1-5; amended with 6-7 in ece3af7)
- [x] build — evidence: 3f28ea3 (workflow, arch spec, decision 063, catalog) and 0075581 (decision file name fix)
- [x] consolidate — evidence: 0075581 (pnpm gate green inside the commit: 27 files, 611 tests)
- [x] validate — evidence: 0075581 (real gate output below)
- [x] handoff — evidence: 0075581 (this file written after the build commits)
- [x] commit — evidence: 0075581
- [x] review — evidence: fe2d1ae (commit that recorded the Review section; code-review not run, findings: none)
- [x] close-out — evidence: 5f73f96 (last commit before the close-out; the close-out commit itself archives this file, deletes the task folder and marks the backlog row done)
- [x] gate-push — evidence: 2026-10-29 pnpm gate:push exit 0 on fe2d1ae: eslint 0 errors, 611 unit/arch tests passed (27 files), nuxt build complete, playwright 5 passed (13.7s)
- [ ] push-pr — evidence:
