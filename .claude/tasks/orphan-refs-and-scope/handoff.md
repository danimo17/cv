# Handoff: orphan-refs-and-scope

_Updated: 2026-10-19. REAL state of the `feat/orphan-refs-and-scope` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise), and for `commit`, `review` and `close-out` it must contain a real commit
sha (7-40 hex characters that exist in the repository and are ancestors of the branch tip); the `review` sha is
the commit that recorded the review in this file (its diff must change the content of `## Review` below; a
progress tick or Pending edit does not count). A code change of the branch after that sha (outside `.claude/`,
or in `.claude/hooks/` or `.claude/workflow-steps.json`; merging `main` does not count) makes the review stale:
re-run `/code-review high`, record it, and re-point the evidence. `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [x] story — evidence: 4ee8e22 (story.md + backlog row `doing`)
- [x] contract — evidence: 4ee8e22 (contract.md, criteria 1-6, each with its test; Notes line added in 159a562)
- [x] build — evidence: 3a55243 (specs, rule 20, docs, written red first: 4 of 4 doc tests failing, orphan scan failing on two injected orphan ids) and the review-fix commits 478e37e, 731271a, 9bc34b9 (each fix drove its new test red first, then green) and 59ff9b9 (rule 20 wording and catalog)
- [x] consolidate — evidence: pnpm gate green on every commit, last full run in the gate:push on 458ede4, 2026-10-19: Test Files 28 passed (28), Tests 619 passed (619)
- [x] validate — evidence: 2026-10-19, real output below: 28 files / 619 tests, 0 lint errors (1 pre-existing warning), 0 type errors, build ok, e2e 5 passed
- [x] handoff — evidence: this file, 2026-10-19
- [x] commit — evidence: 4ee8e22 (story and contract), 3a55243 (specs, rule 20, docs), 478e37e, 731271a, 9bc34b9 (scanner fixes with tests), 59ff9b9 (rule 20 wording, catalog), 159a562 (contract and handoff notes)
- [x] review — evidence: 458ede4 (the commit that recorded the `## Review` section: `/code-review` high, 2026-10-19, round 1, 9 findings, each with outcome and proof; no code change after it)
- [ ] close-out — evidence:
- [x] gate-push — evidence: pnpm gate:push on 458ede4 (2026-10-19, real log read, exit 0): Test Files 28 passed (28), Tests 619 passed (619), nuxt build "Build complete!", e2e 5 passed (13.0s)
- [ ] push-pr — evidence:

## Done (verified)

- Criterion 1: `tests/arch/no-orphan-testids.spec.ts` scans `git ls-files --cached --others --exclude-standard`
  (a listed file deleted from the working tree is skipped); test ids from `e2e/**/*.ts` (specs, helpers, page
  objects, fixtures) and `tests/unit/**` (`get/find/queryBy(All)TestId`, `[data-testid=...]` selectors with `=`,
  `~=`, `^=`, `|=`; `*=` and `$=` fail loudly) against `data-testid` in `app/**/*.vue` (literals, literal
  prefixes, ternaries of literals), comments stripped, ids a test file supplies itself counted for that file only,
  same-file string constants resolved. Anything unresolved goes through `ALLOWLISTS` (`prefixes`, `exact`,
  `unresolved`, all empty today), each entry with a reason and checked to still be in use. The tree is scanned once
  per file. Drive tests on synthetic sources cover every rule.
- Criterion 2: the scan found NO orphans in the current tree (10 distinct ids referenced in e2e/unit, all
  rendered: hero-image, hero-reset, source-banner, meme-card, meme-preview, meme-use, meme-success, theme-toggle,
  locale-switcher, meme-recent-searches). Nothing to fix. Red proof: with `meme-use` and `meme-card` temporarily
  renamed to `meme-use-gone` / `meme-card-gone` in `e2e/meme-flow.spec.ts` the spec failed with
  `e2e/meme-flow.spec.ts:50 references "meme-use-gone", which no component renders` (and :45); reverted with
  `git checkout`.
- Criteria 3-5: `.claude/rules/20-synchronized-change.md`, row 20 in `.claude/hard-rules.md` (summary under 250
  characters), the rule 12 brief line, `## Shared component consumers` in `.claude/templates/contract.md`,
  `workflow.md` steps 1-2, rule 11 reference. `tests/arch/orphan-refs-docs.spec.ts` pins them (plus a fourth test
  for the catalog, added to criterion 6 in the contract).
- Criterion 6: `.claude/docs/catalog/ai-workflow.md` documents rule 20 and both specs.

## In progress / not done

- close-out and push-pr: not ticked yet (see Pending); the close-out is the last commit before the push.
- No dedicated orphan check for props, classes and i18n keys (stated in rule 20 and the catalog; typecheck,
  `i18n-parity.spec.ts` and review cover them).
- `hard-rules.md` has no row 19 (rule 19's file exists, its row was never added); queued to `workflow-integrity-hardening` (finding 9b), not touched here; row 20 follows row 18.
- Found while committing from this linked worktree: the pre-commit hook inherits `GIT_DIR`/`GIT_INDEX_FILE` and a
  spec spawned `git` with `process.env`, so its throwaway-repo commands ran against the real repository (shared
  `.git/config` got `core.bare=true` and a test identity, branch ref moved, stray branches). Repaired locally.
  The isolation files (`tests/setup/clean-git-env.ts`, the `setupFiles` line of `vitest.config.ts`,
  `tests/arch/test-env-isolation.spec.ts`) are identical copies of `feat/arch-rule-gates` (f5a2bfd), carried here
  only so this branch's gate is safe. They are owned by `arch-rule-gates`, which fixes and documents them in its
  catalog; the main thread syncs them afterwards. They are not changed in this task.
- `hook-hardening` (sibling) owns the commit-time hook check of the `## Shared component consumers` section.

## Subagents (rule 12)

| Subagent              | What it did                                                                             | Result                       |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| orphan-refs-and-scope | both specs, rule 20, rule 12/11 text, template, workflow, catalog, backlog row, handoff | criteria 1-6 green, see gate |

## Validation (actual output of the last gate)

```
gate:push on 458ede4 (2026-10-19, exit 0)
  format:check: All matched files use Prettier code style!
  eslint .: 0 errors, 1 warning (pre-existing: CustomInput.vue vue/require-default-prop, decision 041)
  nuxt typecheck: clean
  vitest run: Test Files 28 passed (28), Tests 619 passed (619)
  nuxt build: Build complete!
  playwright test: 5 passed (13.0s)
```

Not covered: orphan props, classes, i18n keys and catalog/docs references; the component to test direction (an unused
component id is not flagged); `data-testid` references written outside `getByTestId`/`findByTestId` and
`[data-testid=...]` forms; comment stripping is textual; the commit-time hook check of the shared component section
(sibling task `hook-hardening`).

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

## Pending on the user

| #   | What                                                      | Blocks            | Status  |
| --- | --------------------------------------------------------- | ----------------- | ------- |
| 1   | Run `/code-review high` over the branch diff              | review, close-out | done    |
| 2   | Permission for the single `git push` of the feat/* branch | push-pr           | pending |
| 3   | Sync the three git isolation files from arch-rule-gates   | merge             | pending |

## Decisions made in this task

- Separate rule 20 rather than folding into rule 07 (contract, open questions); no decision file needed.
- The orphan scan also reads untracked, non-ignored files (`--others --exclude-standard`) so a new test is checked before it is staged.

At close-out, `## Review` and `## Workflow progress` are copied into `.claude/tasks/closed/<slug>.md`. The
close-out is the last commit before the push, taken only after the final review of the full diff (a user-run
`/code-review` included) and its fixes; to reopen after a later finding: `git revert <close-out sha>`, fix,
re-review, close again. The deploy check after merge is reported in chat, not tracked here.
