# Close checklist: orphan-refs-and-scope

Closed on the feature branch `feat/orphan-refs-and-scope` before the single push (decision 057), on 2026-10-19, as
the last commit of the branch, after a high-effort `/code-review` round (9 findings, each fixed with a test, closed
as no change needed, or queued). Verified on the tree of `728d05c` (the last commit before this one; every commit
after `458ede4`, the commit that recorded the review, only touches `.claude/`). The merge and the post-merge deploy
check are not archived. The only open line is `push-pr`.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one. 1: `tests/arch/no-orphan-testids.spec.ts` › "every test id used in tests exists in a component" (plus the driver tests for each scanner rule); 2: the same scan passes on the current tree, no orphan found, `pnpm gate:push` green; 3: `tests/arch/orphan-refs-docs.spec.ts` › "rule 20 exists in hard-rules and rules and names its spec"; 4: › "rule 12 brief requires a repo-wide reference grep"; 5: › "contract template and workflow require the shared component consumers question"; 6: › "the catalog documents rule 20 and the orphan specs" and › "the catalog states the real number of tests of the orphan test id spec", with `docs-sync.spec.ts`
- [x] `pnpm gate:push` real output confirmed green from the log, not the task notification, on 458ede4 (2026-10-19, exit 0): Test Files 28 passed (28), Tests 619 passed (619), 0 lint errors (1 pre-existing warning), typecheck clean, nuxt build "Build complete!", e2e 5 passed (13.0s)
- [x] `/code-review` ran over the whole branch diff: `code-review` high, 2026-10-19, round 1, noted in `## Review` below; recorded by 458ede4
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: none was made (rule 20 stays a separate rule, recorded in the contract's open questions; no `nuxt.config.ts` or `eslint.config.mjs` change)
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: no component, store, composable, token or class changed; the workflow catalog (`ai-workflow.md`) documents rule 20, both arch specs and their limits
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no standard changed; `workflow.md`, rule 11, rule 12, rule 20 and the contract template carry the new wording
- [x] No flagged/unresolved rule-11 conflict left open (handoff Pending: the push permission and the sync of the isolation files from arch-rule-gates, neither a conflict)
- [x] `.claude/backlog.md` row for this task set to `done`

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff:

- [x] Secrets (01) none; company (02) none, no declared sources needed; giphy (03), PII (04), i18n (05), CSS (08),
      primitives (026, 038), accessibility and UI consistency (16): n/a, the diff touches arch specs and process
      docs only; branch (06) `feat/orphan-refs-and-scope`; catalog (07) `ai-workflow.md` updated for the spec and
      rule 20; gates (09) `pnpm gate` green on every commit; contract (10) criteria 1-6 each with a named test, the
      isolation files carried from `arch-rule-gates` are noted in the contract; decisions (11) none new; living
      docs (027) consulted; subagents (12) listed below.

`/code-review` result: high, 2026-10-19, round 1 (a read-only reviewer agent ran `/code-review` at the user's
request, 9 findings). Every finding is closed below; a test proves each fix (the tests live in files created on
this branch, so their proofs are `new`).

- finding 1 — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › a tracked file deleted from the working tree is skipped instead of crashing the scan — searched: deleted from the working tree
- finding 2 — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › e2e helpers, page objects and fixtures are scanned like the specs — searched: page objects
- finding 3a — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › ids a test supplies itself are defined for that test file only — searched: supplies itself
- finding 3b — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › ids that only appear in comments neither count as references nor as rendered ids — searched: only appear in comments
- finding 4a — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › a ternary of literals in a component binding renders every branch — searched: ternary of literals
- finding 4b — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › an exact id allowlist entry covers an id a component builds at run time — searched: exact id allowlist
- finding 4c — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › a same-file string constant resolves a test id argument — searched: string constant
- finding 4d — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › regex arguments and unresolved expressions need an explicit allowlist entry — searched: regex arguments
- finding 4e — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › attribute selector operators are supported or fail loudly — searched: selector operators
- finding 4f — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › stale or reasonless allowlist entries are reported — searched: reasonless
- finding 5 — outcome: fixed — proof: new tests/arch/orphan-refs-docs.spec.ts › rule 20 exists in hard-rules and rules and names its spec — searched: names its spec
- finding 6 — outcome: no_change_needed — proof: wording only; the git isolation files are verbatim copies owned by arch-rule-gates (f5a2bfd), not changed here; the contract Notes and the handoff now say so
- finding 7 — outcome: no_change_needed — proof: owned and fixed in feat/arch-rule-gates; files synced by the main thread (checked: the three isolation files here are identical to that branch's, nothing else in this task depends on them)
- finding 8 — outcome: fixed — proof: new tests/arch/no-orphan-testids.spec.ts › the repository is scanned once for the whole file — searched: scanned once
- finding 9a — outcome: fixed — proof: new tests/arch/orphan-refs-docs.spec.ts › the catalog states the real number of tests of the orphan test id spec — searched: real number of tests
- finding 9b — outcome: queued — proof: workflow-integrity-hardening, hard-rules.md has no row 19 (rule 19 has a file but no row); outside this task's scope

## Workflow progress

Pasted from the handoff, ticked with evidence for every step before `push-pr`.

- [x] story — evidence: 4ee8e22 (story.md + backlog row `doing`)
- [x] contract — evidence: 4ee8e22 (contract.md, criteria 1-6, each with its test; Notes line added in 159a562)
- [x] build — evidence: 3a55243 (specs, rule 20, docs, written red first: 4 of 4 doc tests failing, orphan scan failing on two injected orphan ids) and the review-fix commits 478e37e, 731271a, 9bc34b9 (each fix drove its new test red first, then green) and 59ff9b9 (rule 20 wording and catalog)
- [x] consolidate — evidence: pnpm gate green on every commit, last full run in the gate:push on 458ede4, 2026-10-19: Test Files 28 passed (28), Tests 619 passed (619)
- [x] validate — evidence: 2026-10-19, real output below: 28 files / 619 tests, 0 lint errors (1 pre-existing warning), 0 type errors, build ok, e2e 5 passed
- [x] handoff — evidence: this file, 2026-10-19
- [x] commit — evidence: 4ee8e22 (story and contract), 3a55243 (specs, rule 20, docs), 478e37e, 731271a, 9bc34b9 (scanner fixes with tests), 59ff9b9 (rule 20 wording, catalog), 159a562 (contract and handoff notes)
- [x] review — evidence: 458ede4 (the commit that recorded the `## Review` section: `/code-review` high, 2026-10-19, round 1, 9 findings, each with outcome and proof; no code change after it)
- [x] close-out — evidence: 728d05c (the last commit before the close; the close commit is the last commit of the branch and cannot cite itself, its archive is `.claude/tasks/closed/orphan-refs-and-scope.md`)
- [x] gate-push — evidence: pnpm gate:push on 458ede4 (2026-10-19, real log read, exit 0): Test Files 28 passed (28), Tests 619 passed (619), nuxt build "Build complete!", e2e 5 passed (13.0s)
- [ ] push-pr — evidence:
