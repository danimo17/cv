# Handoff: close-workflow-redesign

_Updated: 2026-10-06 (reopened after the user's full-branch review; review-fixes slice and the second review round built). REAL state of the `feat/close-workflow-redesign` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise). `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [x] story — evidence: 203496b (story.md, ACTIVE, backlog `doing`)
- [x] contract — evidence: 203496b (contract.md with 11 Given/When/Then criteria at that commit; criteria 12-16 added in 0b2b180, 17-24 in 7f0ceea)
- [x] build — evidence: 73871d8 (workflow docs slice) + b206a86 (hook rewrite + hook spec) + 15908bf (gate-everywhere) + 959bb0c and 6c2bd7f (review-fixes: criteria 17-24) + 49ba305 and d196717 (review-fixes-2: criteria 25-30)
- [x] consolidate — evidence: pnpm gate green on d196717: Test Files 23 passed (23), Tests 533 passed (533), lint 0 errors (1 warning), typecheck ok
- [x] validate — evidence: red first on review-fixes-2 (hook spec 32 failed, workflow-steps spec 3 failed), then 232 and 12 passed; earlier slices and the old-hook comparison are in Validation
- [x] handoff — evidence: this file, reopened and rewritten after the user's review (the Review section below is pending on purpose)
- [ ] commit — evidence:
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- hook-and-tests slice (criteria 1, 2, 4, 5, 7, 8): `.claude/hooks/require-contract.py` rewritten (closing by
  staged deletions, HEAD/index-based reads, ACTIVE-empty push via branch slug, progress evidence + completeness)
  and `tests/arch/require-contract-hook.spec.ts` (56 tests, throwaway git repos). `story` gate flipped to
  `require-contract` (story.md now required by the hook); catalog `ai-workflow.md` describes the final behavior.
- workflow-docs slice (criteria 3, 6, 9, 11): `.claude/workflow-steps.json`, rewritten `.claude/workflow.md`,
  `templates/close-checklist.md`, `templates/handoff.md`, `hard-rules.md` rows 09/10, `rules/09-gates.md`,
  `rules/10-contract-first.md`, decision 057 (+ "Superseded in part by 057" notes on 042 and 051), catalog
  `ai-workflow.md`, `tests/arch/workflow-steps.spec.ts` (4 criterion tests + 1 json well-formedness test).

- gate-everywhere slice (criteria 12-16, from the 2026-10-05 high `/code-review`): `require-contract.py` rewritten
  into one script with four invocations (Claude stdin-JSON, `--commit`, `--pre-push`, `--ci <branch> <sha>`); slug
  comes from the `feat/<slug>` branch name and `ACTIVE` is ignored on feat branches; the Claude push gate parses
  the refspec and gates the tip of the source ref per `feat/*` destination; `commit`/`review`/`close-out` evidence
  must contain a real commit sha, `[X]` counts as ticked; `.githooks/pre-commit` and `.githooks/pre-push` call the
  script before the pnpm gates; `ci.yml` has a `workflow-gate` job; `HOOK_UNDER_TEST` removed and an arch test
  forbids it; decision 057 has an `Amendment 2026-10-05`; docs/rules/catalog/README/CLAUDE.md say `ACTIVE` is no
  longer needed on feat branches.

- review-fixes slice (criteria 17-24, from the user's high-effort `/code-review` of the whole branch, six findings):
  `require-contract.py` gets the stale-review gate (a commit after the `review` evidence that touches a path
  outside `.claude/` blocks push and the closing commit, naming the sha, the commit and `/code-review high`),
  merge/rebase/cherry-pick/revert exemption from the docs-only rule, `--ci <branch> <sha> [--base <ref>]`,
  `ci.yml` running the base branch's copy of the gate (fallback with a `::notice::` for the PR that introduces
  it), global git options (`-C`, `-c`, `--git-dir`, `--no-pager`, ...) matched by the Claude hook, evidence
  tied to its step (review = ancestor that recorded the review in the handoff/archive; commit and close-out =
  ancestors), unchecked scan limited to real list items outside fenced code; `hard-rules.md` rows 09/10 shortened
  (details in rules 09/10) with the `hard-rules rows stay short` test (limit 700, longest row now 599); docs
  (`workflow.md` steps 8/9, rules 09/10, decision 057 amendment 2026-10-06, catalog, handoff and close-checklist
  templates) say the close-out is the last commit before the push and that `git revert <close-out sha>` reopens;
  `workflow-integrity-hardening` item 6 marks the freshness gate as built. Hook spec 57 new red cases first,
  189 green; workflow-steps spec 3 new red cases, 10 green. Commits `959bb0c`, `6c2bd7f`.

- review-fixes-2 slice (criteria 25-30, from the user's second high-effort `/code-review` of this branch, six
  findings, all fixed): `review` evidence must be a commit that changed the content of the `## Review` section
  (a progress tick or Pending edit no longer qualifies; root commit counts); freshness compares the branch's own
  code diff against the base (`--base`, else `origin/main`, else `main`; three-dot, `-U0`, normalized) so a merge
  of `main` after the review no longer stales it, while a branch edit still does; `.claude/hooks/` and
  `.claude/workflow-steps.json` count as code (edits to the gate itself stale a review); `-c core.hooksPath=...`
  and `--config-env` overrides are refused like `--no-verify`; `ci.yml` probes both `--ci` and `--base` in the
  base copy (new notice `base branch has no --ci/--base gate yet`, plus a test that executes the extracted job
  script against fake base scripts); the unchecked scan covers `*`, `+`, `1.` and `1)` markers. Docs: catalog,
  rules 09/10, workflow step 8, both templates, decision 057 `Amendment 2026-10-06 (second review)`. Fixtures of
  the hook spec were adapted (the `@REVIEW@` commit now adds a Review section; re-record steps change the
  Review). Commits `49ba305`, `d196717`.

## In progress / not done

- Reopened. The premature close commit `ebeb029` was reverted in `c1d0785` (folder and `ACTIVE` back, archive
  removed): the user's review found issues after the close, and a close-out must come after the final review.
  `spacing-tokens` stays closed (`35e6a39`, criterion 10 for that half).
- A fresh `/code-review high` of the final diff (user-run) is pending: the second review round changed
  the hook itself (`.claude/hooks/require-contract.py`) and `ci.yml`, so the previous review is stale by design
  (the new rule 27 counts the gate files as code). After its fixes the order is: record the
  review in `## Review` (a commit that changes this file), tick `commit` and `review` with those shas, run
  `pnpm gate:push`, then the close-out commit (archive + folder deletion + backlog `done`) LAST, then the push
  with the user's permission. Until then the push gate blocks on purpose (review, commit, close-out and
  gate-push are unticked).
- Not run anywhere: the `workflow-gate` job of `ci.yml` (Actions can't be run locally; it was checked for YAML
  validity and by reading, its first real run is the first `feat/*` PR). If the ruleset should make it blocking,
  `workflow-gate` has to be added to the required checks (user action, see Pending).

## Subagents (rule 12)

| Subagent        | What it did                                                                                                                                                                                                                                                                                                                      | Result                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| workflow-docs   | step list json, workflow.md, templates, rules 09/10, hard-rules, decision 057, catalog, workflow-steps arch test                                                                                                                                                                                                                 | done in 73871d8 (see Validation)                                                                                                                 |
| hook-and-tests  | `require-contract.py` rewrite + hook spec (56 tests, written red first: 28 failed, then all green)                                                                                                                                                                                                                               | done in b206a86; interrupted once, a second agent reviewed, finished and verified the partial work (old-hook comparison, docs, handoff evidence) |
| gate-everywhere | criteria 12-16: branch-keyed slug, `--commit`/`--pre-push`/`--ci` modes + git hook and CI wiring, refspec-aware push gate, sha-verified evidence, `HOOK_UNDER_TEST` removed (spec written red first: 50 failed, then green)                                                                                                      | done in 15908bf (script, tests, git hooks, CI) and 29cbbbd (docs); see Validation                                                                |
| review-fixes    | criteria 17-24: stale-review gate, merge/rebase exemption, `--base` CI copy, global git options, evidence tied to its step, fenced unchecked scan, short hard-rules rows, close-out-last docs, story item 6 (specs written red first: hook spec 57 failed, workflow-steps spec 3 failed, then green)                             | done in 959bb0c (hook, hook spec, ci.yml) and 6c2bd7f (docs, workflow-steps spec); see Validation                                                |
| review-fixes-2  | criteria 25-30: Review-section review evidence, branch-diff freshness (merge of main stays fresh), gate files count as code, `core.hooksPath` refused, `--ci`/`--base` probe, every list marker; docs and decision 057 second amendment (specs written red first: hook spec 32 failed, workflow-steps spec 3 failed, then green) | done in 49ba305 (hook, specs, ci.yml) and d196717 (contract, docs, decision); see Validation                                                     |

## Validation (actual output of the last gate)

```
pnpm gate (on d196717, review-fixes-2 slice, pre-commit run, 2026-10-06) → format:check ok, lint 0 errors (1 pre-existing vue/require-default-prop warning), typecheck ok, Test Files 23 passed (23), Tests 533 passed (533)
pnpm test:arch (on the same tree) → Test Files 7 passed (7), Tests 399 passed (399)
review-fixes-2 specs written first: tests/arch/require-contract-hook.spec.ts 32 failed | 200 passed (232) against the hook of 19dfb69, 232 passed after; tests/arch/workflow-steps.spec.ts 3 failed | 9 passed (12) before ci.yml, 12 passed after
pnpm gate (on 6c2bd7f, review-fixes slice, 2026-10-06) → Test Files 23 passed (23), Tests 488 passed (488)
review-fixes specs written first: tests/arch/require-contract-hook.spec.ts 57 failed | 132 passed (189) against the hook of 7f0ceea, 189 passed after; tests/arch/workflow-steps.spec.ts 3 failed | 7 passed (10) before ci.yml/docs, 10 passed after
local smoke of `.claude/hooks/require-contract.py --pre-push` with the pushed tip of this branch (d196717) → exit 2, one problem: `## Workflow progress` has step(s) not ticked with valid evidence: commit, review, close-out, gate-push (not ticked); expected until the review is redone and the close-out is made
pnpm gate:push (on 3ade528, 2026-10-06) → STALE: it predates the review-fixes and review-fixes-2 slices; it has to be re-run on the final tree before the close-out (gate-push is unticked)
```

Earlier runs, kept as history: pnpm gate on 29cbbbd and b206a86 (415 and 350 tests green); the hook spec against
the pre-rewrite hook (`git show 73871d8:.claude/hooks/require-contract.py`) → 28 failed | 28 passed (56), against
the rewritten hook 56 passed. That override was removed afterwards (criterion 16).

Not covered: the hook can't prove evidence is true (a resolvable commit sha tied to its step, not that the review
actually happened or covered the whole diff), doesn't judge `story` content or `validate`; the freshness check
compares branch diffs textually against a locally known base (a stale `origin/main`, or a main edit overlapping
a hunk the branch changed, errs towards stale), and the `core.hooksPath` refusal only sees `-c`/`--config-env` on the command (git config files and `GIT_CONFIG_*` variables are not seen); the
Claude hook only sees commands run through Claude's Bash tool, the git hooks can be skipped with `--no-verify`
(CI `workflow-gate` is the backstop, only blocking if it is a required check); the `workflow-gate` job has
never run in Actions (it was checked for YAML validity with `yaml.safe_load`, by reading, and its shell logic
with a local base-copy probe) and on this very PR it will take the fallback branch (the base has no `--ci`).

## Review (workflow step `review`, rule 09)

Status: pending. A fresh `/code-review` of the full diff after the second review round (user-run, at high
effort, `/code-review high`) has not happened yet. This round changed the hook itself
(`.claude/hooks/require-contract.py`) and `ci.yml`, so the previous review is stale by design: no check of any
earlier review is carried over as done, and the section is rewritten when the new review runs. The `review`
progress line stays unticked until then (`push-review-gate` blocks the push meanwhile, which is intended); the
review is recorded by a commit that changes this section (criterion 25), and that commit's sha is what the
`review` evidence cites.

History, kept so nothing is lost: the 2026-10-05 checklist run covered 28 files and the first `code-review` at
high effort found six issues in the hook rewrite, all fixed in `15908bf` and `29cbbbd` (criteria 12-16):
the slug read from `ACTIVE` (fixed: branch name), checks only inside Claude's Bash tool (fixed: git hooks and
CI run the same script), free-text evidence (fixed: real commit sha), the push gate reading the checked-out
branch (fixed: refspec-aware), `[X]` not read as ticked (fixed), and the `HOOK_UNDER_TEST` override in the spec
(fixed: removed and forbidden by a test). The user's later full-branch `/code-review` (2026-10-06, high) found
six more, which are criteria 17-24 and are fixed in `959bb0c` and `6c2bd7f`: stale reviews were not detected
(17, 21), merge/rebase/revert commits hit the docs-only rule (18), a PR could weaken its own CI gate (19),
`git -C`/`-c`/`--git-dir` hid commit and push from the Claude hook (20), the unchecked scan matched prose and
fenced code (22), and the `hard-rules.md` rows were too long to edit safely (23); the close-out-last order and
the way to reopen are documented (24). The user's second high-effort `/code-review` (2026-10-06) of the result
found six more, criteria 25-30, all fixed in `49ba305` and `d196717`: `review` evidence only had to touch the
handoff (fixed: it must change the `## Review` section, 25), freshness walked every reachable commit so a merge
of `main` staled it (fixed: branch-own diff against the base, 26), edits to the gate itself did not stale a
review (fixed: `.claude/hooks/` and `.claude/workflow-steps.json` count as code, 27), `-c core.hooksPath=...`
bypassed the git hooks (fixed: refused like `--no-verify`, 28), the CI base-copy probe only checked `--ci`
(fixed: `--ci` and `--base`, 29) and the unchecked scan missed `*`, `+` and numbered items (fixed, 30). These
fixes are covered by tests and have not been re-reviewed, which is exactly what the pending review is for.

## Pending on the user

| #   | What                                                                                                                                                                                                                                                                        | Blocks                             | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------- |
| 1   | Run `/code-review high` on the final diff of this branch (after the review-fixes-2 slice, `49ba305`, `d196717`; the previous review is stale by design), then have the findings fixed and the review recorded; the gates block the push and the close-out until it is fresh | `review`, `close-out`, `push-pr`   | pending |
| 2   | Explicit permission for the single `git push` of `feat/close-workflow-redesign` (rule 06, decision 031); the AI then opens the PR                                                                                                                                           | `push-pr`                          | pending |
| 3   | After the PR's first CI run, add the `workflow-gate` job to the required checks of the `main` ruleset (a skipped job passes, so it is safe to add); until then the CI backstop for `git push --no-verify` is not blocking                                                   | making the CI backstop hard        | pending |
| 4   | Know that after the merge the new flow applies: `merge` is yours, `deploy-check` is post-merge and non-blocking (the AI reports `deploy.yml` in chat; a failed deploy is a new task, never a reopened one)                                                                  | nothing, awareness of the new flow | info    |
| 5   | `button-system`, `css-tailwind-first` and `workflow-integrity-hardening` stay `todo` in the backlog; the latter's item 6 now only owes the proactive `/code-review` nudge wording and an effort-level minimum                                                               | nothing                            | info    |

## Decisions made in this task

- → `.claude/docs/decisions/057-close-out-before-single-push.md` (with its `Amendment 2026-10-05`,
  `Amendment 2026-10-06` and `Amendment 2026-10-06 (second review)`)
