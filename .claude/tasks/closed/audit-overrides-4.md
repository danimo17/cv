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

- [x] Every acceptance criterion in `contract.md` is verified done, one by one: (1) `pnpm audit --audit-level=high` exits 0 after three overrides (`node-forge@<=1.4.0` to `^1.4.1`, `serialize-javascript@<7.1.3` to `^7.1.3`, `glob@>=9.0.0 <14.0.2` to `^14.0.2`) and the `nuxt` `^4.6.3` and `vue` `^3.5.44` bumps; every patched version exists on npm and is older than 24 hours; no ignore was added and the stale `GHSA-86w9-cpqp-85rv` ignore was removed with the user's approval; `deepmerge` (low, no 4.3.2 on npm) and `minimatch` (moderate, 11.x breaks ESLint) stay open by the user's decision. (2) `tests/arch/audit-overrides.spec.ts` strengthened (lockfile floors for the new packages, single `vue`, no orphan patch file, an ignore must still match the lockfile, ignore-entry parser, catalog prose), decision 064 with remove-when and a 2026-10-31 addendum, decision 056 amended, 12 tests passing. (3) the `@nuxt/devtools@3.4.2` patch, its file and the `simple-git` and `@simple-git/argv-parser` overrides are removed. (4) lint, typecheck, unit, arch, build and e2e pass in `gate:push`.
- [x] `pnpm gate:push` real output confirmed green from the log file, not a task notification: eslint 0 errors, nuxt typecheck clean, 34 test files / 701 tests passed, "Build complete!", playwright "5 passed (10.8s)", EXIT=0 (2026-10-31, on 872aa20, the last code commit; later commits only touch `.claude/`).
- [x] `/code-review` ran over the whole branch diff: `/code-review high` round 1 over the branch and round 2 over the delta (2026-10-31), 14 findings, each recorded in `## Review` with an outcome and proof.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `064-audit-overrides-2026-10-31.md` (with the addendum) and the amendment in `056-audit-overrides-and-ignored-advisories.md`.
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: none changed; `ai-workflow.md` updated for the strengthened arch test.
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no convention changed.
- [x] No flagged/unresolved rule-11 conflict left open: `deepmerge` and `minimatch` have no usable patched release, the user decided to leave them open and not ignored; the node-forge ignore was removed with the user's explicit approval.
- [x] `.claude/backlog.md` row for this task set to `done`.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (dependency and config
only: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, one deleted patch, one arch test, decisions 056 and 064,
catalog, backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; sources are the public npm registry and GitHub advisories.
- [x] Branch (06): on `feat/audit-overrides-4`. Catalog (07): `ai-workflow.md` updated for the strengthened arch test. Gates (09): `pnpm gate` green in every commit, `gate:push` green. Contract (10): criteria 1-4 each map to the audit exit 0, the arch tests and `gate:push`. Decisions (11): 064 written, 056 amended with the user's approval to remove one ignore, no ignore added.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the handoff names the single subagent.

code-review high, 2026-10-31. Round 1 over `origin/main...bf85676` (the first run of the skill reviewed the uncommitted
tree of the main checkout instead of this branch and its output was discarded; the rerun was pointed at the worktree).
Round 2 over the delta `bf85676..260ef0a` only. Fixes: 260ef0a (round 1) and 872aa20 (round 2).

- finding r1-1 — outcome: fixed — proof: strengthened tests/arch/audit-overrides.spec.ts › every patched dependency has an existing patch file that still matches the locked version
- finding r1-2 — outcome: no_change_needed — proof: the handoff and the Pending table were stale only until this re-close; this file is rewritten against the final tree and the close and push gates read it
- finding r1-3 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › the catalog paragraph on this arch test is well formed prose — searched: catalog paragraph, well formed — differs: docs-sync.spec.ts checks that each artifact has a catalog block, not the prose of this one paragraph
- finding r1-4 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r1-5 — outcome: no_change_needed — proof: glob 14.0.3 keeps the CommonJS entry and exports `sync`, `glob`, `globSync` and `hasMagic`, the only APIs `archiver-utils`, `@vercel/nft` and `js-beautify` call; `pnpm gate:push` (Nitro build with `@vercel/nft`, 701 tests) and `wrangler deploy --dry-run` pass; the minimatch break was in `eslint-plugin-import-x` importing `makeRe`, which glob's own `minimatch` dependency does not involve
- finding r1-6 — outcome: no_change_needed — proof: prose-only correction in decision 064 (the audit figure is now "2 vulnerabilities, 1 low | 1 moderate", dated 2026-10-31); a snapshot of tool output cannot be asserted by a test
- finding r1-7 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › the lockfile resolves a single vue version so the Nuxt auto-import types augment it — searched: single vue, auto-import types
- finding r1-8 — outcome: no_change_needed — proof: this record replaces "code-review: not run"; both rounds of `/code-review high` are recorded here
- finding r2-1 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › the catalog paragraph on this arch test is well formed prose — searched: catalog paragraph, well formed — differs: docs-sync.spec.ts checks that each artifact has a catalog block, not the prose of this one paragraph
- finding r2-2 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r2-3 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r2-4 — outcome: no_change_needed — proof: the coupling between the `simple-git` override and a patch was removed on purpose in r1-1 (no patch exists any more); the remaining loop checks existence, locked version and decision for any future patch
- finding r2-5 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r2-6 — outcome: no_change_needed — proof: the audit figure in decision 064 carries its date (2026-10-31) since 872aa20; prose only

## Workflow progress

Pasted from the handoff, ticked with evidence for every step before `push-pr`.

- [x] story — evidence: c5f8978 (story.md, contract.md and backlog row `doing`)
- [x] contract — evidence: c5f8978 (contract.md, criteria 1-4)
- [x] build — evidence: 0d9bc77 (three overrides, nuxt and vue bumps, patch removed, lockfile, decision 064, arch test, catalog)
- [x] consolidate — evidence: 0d9bc77 (pnpm gate green in the commit hook: 34 files / 698 tests)
- [x] validate — evidence: 2026-10-31 pnpm gate 34 files / 701 tests passed, 0 lint errors, typecheck clean; pnpm audit --audit-level=high exit 0
- [x] handoff — evidence: handoff.md rewritten 2026-10-31 after the reopen, Review round 1 and 2 recorded
- [x] commit — evidence: 872aa20 (last code commit; first was 0d9bc77)
- [x] review — evidence: 3d434f8 (commit that recorded the Review section: /code-review high, round 1 on the branch diff and round 2 on the delta, 14 findings, each with an outcome)
- [x] close-out — evidence: 6b3a1c7 (last commit before the close-out; the close-out commit itself archives this file, deletes the task folder and marks the backlog row done)
- [x] gate-push — evidence: 2026-10-31 pnpm gate:push exit 0 on 872aa20: 701 unit/arch tests passed (34 files), nuxt build complete, playwright 5 passed (10.8s)
- [ ] push-pr — evidence:
