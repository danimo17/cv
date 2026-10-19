# Handoff: orphan-refs-and-scope

_Updated: 2026-10-19 11:45. REAL state of the `feat/orphan-refs-and-scope` branch._

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
- [x] contract — evidence: 4ee8e22 (contract.md, criteria 1-6, each with its test)
- [x] build — evidence: specs tests/arch/no-orphan-testids.spec.ts and tests/arch/orphan-refs-docs.spec.ts written red first (4 of 4 doc tests failing, orphan scan failing on two injected orphan ids), then rule 20, rule 12/11 text, template, workflow and catalog until green
- [x] consolidate — evidence: pnpm gate green on 2026-10-19 (see Validation)
- [x] validate — evidence: 2026-10-19, real pnpm gate output below, 27 files / 606 tests, 0 lint errors, 0 type errors
- [x] handoff — evidence: this file, 2026-10-19
- [x] commit — evidence: 4ee8e22 (story and contract), 3a55243 (specs, rule 20, docs, handoff)
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- Criterion 1: `tests/arch/no-orphan-testids.spec.ts` scans `git ls-files --cached --others --exclude-standard`;
  test ids from `e2e/**/*.spec.ts` and `tests/unit/**` (`get/find/queryBy(All)TestId`, `[data-testid=...]`
  selectors incl. `^=`) against `data-testid` in `app/**/*.vue` (literal and literal-prefix bindings). Dynamic
  prefixes only through `DYNAMIC_PREFIXES` (empty today, each entry needs a reason and a matching binding). A
  self-test drives the scanner on synthetic sources.
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

- review, close-out, gate-push, push-pr: not ticked (see Pending). `pnpm gate:push` was run once and passed
  (see Validation); the gate-push step is ticked after the review and close-out commits.
- No dedicated orphan check for props, classes and i18n keys (stated in rule 20 and the catalog; typecheck,
  `i18n-parity.spec.ts` and review cover them).
- `hard-rules.md` has no row 19 (rule 19's file exists, its row was never added); not touched here, row 20 follows row 18.
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
pnpm gate → format:check: All matched files use Prettier code style!
            eslint .: 0 errors, 1 warning (pre-existing: CustomInput.vue vue/require-default-prop, decision 041)
            nuxt typecheck: clean
            vitest run: Test Files 27 passed (27), Tests 606 passed (606)
pnpm gate:push (run once at the end, 2026-10-19) → gate as above + build ok + e2e: 5 passed (15.3s), exit 0
```

Not covered: orphan props, classes and i18n keys; `data-testid` references written outside `getByTestId`/`findByTestId`
/ `[data-testid=...]` forms; ids built at run time in a component; the commit-time hook check of the shared
component section (sibling task `hook-hardening`).

## Review (workflow step `review`, rule 09)

Pending: the user runs `/code-review high` over the whole branch diff, then the review checklist is filled and the
outcome recorded here. Nothing is claimed as reviewed yet.

## Pending on the user

| #   | What                                                      | Blocks            | Status  |
| --- | --------------------------------------------------------- | ----------------- | ------- |
| 1   | Run `/code-review high` over the branch diff              | review, close-out | pending |
| 2   | Permission for the single `git push` of the feat/* branch | push-pr           | pending |

## Decisions made in this task

- Separate rule 20 rather than folding into rule 07 (contract, open questions); no decision file needed.
- The orphan scan also reads untracked, non-ignored files (`--others --exclude-standard`) so a new test is checked before it is staged.

At close-out, `## Review` and `## Workflow progress` are copied into `.claude/tasks/closed/<slug>.md`. The
close-out is the last commit before the push, taken only after the final review of the full diff (a user-run
`/code-review` included) and its fixes; to reopen after a later finding: `git revert <close-out sha>`, fix,
re-review, close again. The deploy check after merge is reported in chat, not tracked here.
