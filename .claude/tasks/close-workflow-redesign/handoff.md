# Handoff: close-workflow-redesign

_Updated: 2026-10-06 (review-fixes-3 slice built: findings become tests, search first; the user's third review applied). REAL state of the `feat/close-workflow-redesign` branch._

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

- review-fixes-3 slice (criteria 31-34, from the user's third `/code-review` and the user's decision that findings
  must become tests, search first; see decision 057 `Amendment 2026-10-06 (third review: findings become tests,
search first)`): `require-contract.py` blocks, at commit time, a code commit with no staged `tests/` or `e2e/` file
  once the handoff's `review` step is ticked at `HEAD` (merge/rebase/cherry-pick/revert and closing commits exempt);
  freshness ignores a later code commit that also changes a test file (`tests/` and `e2e/` are no longer code
  paths) and fails closed when `git diff` errors; every `## Review` finding line is checked at push (all callers)
  and at close: `fixed` = `strengthened <file> › <name>` (exists at the base, file differs) or `new <file> › <name> —
searched: <terms>` (not at the base, and the gate greps every test/describe/it title itself, `— differs:` to
  justify a hit), `queued` = a backlog slug / task folder / archive, `no_change_needed` = a reason, none = `findings:
none`; `git config ... core.hooksPath` and `GIT_CONFIG_KEY_<n>=core.hooksPath` are refused, `git commit -nm`/`-anm`
  are refused like `--no-verify` (`git push -n` stays a dry run), env prefixes with digits no longer hide the git
  call, one `base_ref` name and one `code_changes_after` helper. New `tests/arch/no-duplicate-test-titles.spec.ts`
  (it found and I merged one duplicate: the two `rejects %s with GiphyQueryError` tables of
  `tests/unit/server/giphy.spec.ts`). The third-round cases were added next to their siblings
  (`core.hooksPath override is refused like --no-verify`, `commit rules that predate decision 057 still hold`,
  `global git options do not hide commit or push from the hook`, `a code commit after the review evidence makes the
review stale`) instead of new describes (search first), and contract criterion 33's test column says so. Docs:
  workflow.md step 8 + `## Review policy`, rule 09, decision 057 third amendment, catalog, both templates,
  `workflow-integrity-hardening` item 8 (the Review-text-edit finding, queued). The `workflow-steps.json` gates are
  unchanged on purpose: `build` stays `pre-commit` and `review` stays `push-review-gate`, which is what really
  fails today (the post-review test requirement is a `require-contract` commit-time check and is listed in the
  Gates table, not claimed as the build step's gate).

## In progress / not done

- Reopened. The premature close commit `ebeb029` was reverted in `c1d0785` (folder and `ACTIVE` back, archive
  removed): the user's review found issues after the close, and a close-out must come after the final review.
  `spacing-tokens` stays closed (`35e6a39`, criterion 10 for that half).
- Round 3 (the user's third `/code-review`, applied in the review-fixes-3 slice) is the last full review under the
  new policy. Next: the review is recorded in `## Review` by a commit that changes this section, `commit` and
  `review` are ticked with those shas (main thread), `pnpm gate:push` runs, then the close-out commit (archive +
  folder deletion + backlog `done`) LAST, then the push with the user's permission. Any code change after the
  recorded review must carry a test (commit-time gate) or the review goes stale. `review`, `commit`, `close-out`
  and `gate-push` stay unticked until then, so the push gate blocks on purpose.
- Not run anywhere: the `workflow-gate` job of `ci.yml` (Actions can't be run locally; it was checked for YAML
  validity and by reading, its first real run is the first `feat/*` PR). If the ruleset should make it blocking,
  `workflow-gate` has to be added to the required checks (user action, see Pending).

## Subagents (rule 12)

| Subagent        | What it did                                                                                                                                                                                                                                                                                                                                                                                         | Result                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| workflow-docs   | step list json, workflow.md, templates, rules 09/10, hard-rules, decision 057, catalog, workflow-steps arch test                                                                                                                                                                                                                                                                                    | done in 73871d8 (see Validation)                                                                                                                 |
| hook-and-tests  | `require-contract.py` rewrite + hook spec (56 tests, written red first: 28 failed, then all green)                                                                                                                                                                                                                                                                                                  | done in b206a86; interrupted once, a second agent reviewed, finished and verified the partial work (old-hook comparison, docs, handoff evidence) |
| gate-everywhere | criteria 12-16: branch-keyed slug, `--commit`/`--pre-push`/`--ci` modes + git hook and CI wiring, refspec-aware push gate, sha-verified evidence, `HOOK_UNDER_TEST` removed (spec written red first: 50 failed, then green)                                                                                                                                                                         | done in 15908bf (script, tests, git hooks, CI) and 29cbbbd (docs); see Validation                                                                |
| review-fixes    | criteria 17-24: stale-review gate, merge/rebase exemption, `--base` CI copy, global git options, evidence tied to its step, fenced unchecked scan, short hard-rules rows, close-out-last docs, story item 6 (specs written red first: hook spec 57 failed, workflow-steps spec 3 failed, then green)                                                                                                | done in 959bb0c (hook, hook spec, ci.yml) and 6c2bd7f (docs, workflow-steps spec); see Validation                                                |
| review-fixes-2  | criteria 25-30: Review-section review evidence, branch-diff freshness (merge of main stays fresh), gate files count as code, `core.hooksPath` refused, `--ci`/`--base` probe, every list marker; docs and decision 057 second amendment (specs written red first: hook spec 32 failed, workflow-steps spec 3 failed, then green)                                                                    | done in 49ba305 (hook, specs, ci.yml) and d196717 (contract, docs, decision); see Validation                                                     |
| review-fixes-3  | criteria 31-34 (interrupted once; the partial work was reviewed, corrected and finished): post-review test requirement at commit time, tested-fix freshness exemption, finding proof with search first, `no-duplicate-test-titles` arch test, third-round fixes next to their sibling tests, review policy docs, handoff Review rewritten in the finding format (specs written red first: 27 failed | 274 passed of 301, then green)                                                                                                                   | done in the commits listed in Done; see Validation |

## Validation (actual output of the last gate)

```
pnpm gate (working tree of the review-fixes-3 slice, before its commits, 2026-10-06) → format:check ok, lint 0 errors (1 pre-existing vue/require-default-prop warning), typecheck ok, Test Files 24 passed (24), Tests 593 passed (593)
review-fixes-3 specs written first: tests/arch/require-contract-hook.spec.ts + workflow-steps.spec.ts 27 failed | 274 passed (301) against the partial hook of the interrupted agent, 304 passed after; the third-round cases (-nm cluster, chained config / GIT_CONFIG_KEY, env prefix digits, fails closed) 11 failed against the committed hook of 968394a; tests/arch/no-duplicate-test-titles.spec.ts 1 failed (tests/unit/server/giphy.spec.ts repeated a title) | 2 passed, 3 passed after merging the two tables
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
a hunk the branch changed, errs towards stale), and the `core.hooksPath` refusal sees `-c`/`--config-env`, a chained `git config ... core.hooksPath` and `GIT_CONFIG_KEY_<n>=core.hooksPath` in the same command (a setting made in an earlier command, a config file or an exported variable is not seen); the finding proof checks titles textually (no semantic duplicate detection) and proves that bug cannot return, not that the fix adds none elsewhere; tests created on this branch can only be cited as `new` because the base has none; the
Claude hook only sees commands run through Claude's Bash tool, the git hooks can be skipped with `--no-verify`
(CI `workflow-gate` is the backstop, only blocking if it is a required check); the `workflow-gate` job has
never run in Actions (it was checked for YAML validity with `yaml.safe_load`, by reading, and its shell logic
with a local base-copy probe) and on this very PR it will take the fallback branch (the base has no `--ci`).

## Review (workflow step `review`, rule 09)

Status: the review of the final diff is user-run (`/code-review high`) and recorded by a commit that changes this
section (criterion 25); the `review`, `commit`, `close-out` and `gate-push` progress lines stay unticked until the
main thread ticks them. Rounds 0-3 below are the reviews already run on this branch: round 3 is the last full
review under the new policy (workflow.md `## Review policy`: a finding becomes a test, search first, at most two
rounds per task, the second only the delta).

- [x] review-checklist (`.claude/templates/review-checklist.md`) run over the full branch diff on 2026-10-05 (28 files); the changes since are the hook, its specs and `.claude/` docs
- [x] `code-review` ran at high effort on 2026-10-05 and three times on 2026-10-06 (rounds 0 to 3 below); every finding has its outcome and proof, checked by the gate

Proof format (decision 057, third amendment): all the spec files cited below were created on this branch, so the
base ref (`origin/main`) has no earlier test to strengthen and every `fixed` proof is a `new` test; where the
search finds sibling tests of the same gate, the `differs` reason says why. The three findings whose fix is not a
new test are explained in their line (`no_change_needed` for behavior-preserving refactors, `queued` for the
deliberate-evasion finding).

### Round 0 — first `/code-review` at high effort, 2026-10-05 (criteria 12-16)

- finding r0-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › slug comes from the feat branch name, ACTIVE is ignored on feat branches — searched: ACTIVE, slug, branch name — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › git pre-push mode gates the pushed ref — searched: pre-push, pushed ref — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-3 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › evidence must be a real commit sha for commit/review/close-out — searched: real commit sha, evidence — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › push gate follows the pushed refspec, not the checked-out branch — searched: refspec, checked-out — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-5 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › uppercase [X] ticks are parsed — searched: uppercase, ticks — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-6 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › arch specs have no test-only hook overrides — searched: HOOK_UNDER_TEST, hook overrides

### Round 1 — user full-branch `/code-review` at high effort, 2026-10-06 (criteria 17-24)

- finding r1-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a code commit after the review evidence makes the review stale — searched: stale, review evidence — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › merge, rebase and revert commits are not blocked by the docs-only rule — searched: merge, rebase, revert — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-3 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › ci runs the base branch copy of the workflow gate — searched: base branch copy, workflow gate — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › global git options do not hide commit or push from the hook — searched: global git options — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-5 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › unchecked scan ignores fenced code and prose — searched: fenced, prose, unchecked scan — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-6 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › hard-rules rows stay short — searched: hard-rules

### Round 2 — user second `/code-review` at high effort, 2026-10-06 (criteria 25-30)

- finding r2-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › review evidence must be a commit that changed the Review section — searched: Review section, review evidence — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › merging main after the review does not make it stale — searched: merging main — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-3 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › edits to the gate itself make the review stale — searched: gate itself — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › core.hooksPath override is refused like --no-verify — searched: hooksPath, no-verify — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-5 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › ci falls back unless the base copy supports --ci and --base — searched: falls back, base copy — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-6 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › unchecked scan covers every list marker — searched: list marker — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate

### Round 3 — user third `/code-review` at high effort, 2026-10-06 (criteria 31-34); the last full review under the new policy

- finding r3-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a chained git config write or GIT_CONFIG_KEY env prefix is refused too: %s — searched: chained git config, GIT_CONFIG_KEY — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r3-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › --no-verify and -n are blocked, also as a short-flag cluster (-nm, -anm, -sn, a trailing -n) — searched: short-flag cluster, -nm — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r3-3 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › freshness fails closed when git diff errors: two unreadable diffs are not "equal" — searched: fails closed, git diff errors — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r3-4 — outcome: no_change_needed — proof: the three names for the comparison ref (`steps_ref`, `base`, `base_ref`) were unified to `base_ref`/`resolve_base`; a behavior-preserving rename has no test that can fail before and pass after, the behavior stays covered by `--ci --base reads the step list from the base ref` and `a later code commit with a test does not stale the review, without a test it does` (both green)
- finding r3-5 — outcome: no_change_needed — proof: the two commit walks for the first later code commit were merged into one helper (`code_changes_after`); behavior-preserving refactor, covered by `a code commit after the review evidence makes the review stale` and `merging main after the review does not make it stale` (both green)
- finding r3-6 — outcome: queued — proof: workflow-integrity-hardening item 8 (editing the `## Review` text after later code changes resets freshness; residual risk accepted by the user decision 2026-10-06, mitigated by the test requirement and the finding proof)

Counting note: the earlier prose history named the 2026-10-05 review as the "first" and the two 2026-10-06 user
reviews as the "full-branch" and "second" ones; with today's they are rounds 0, 1, 2 and 3.

## Pending on the user

| #   | What                                                                                                                                                                                                                                                                                                                                                            | Blocks                             | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------- |
| 1   | Decide whether the review-fixes-3 delta needs a second pass: round 3 is the last full review (policy: at most two rounds, the second only the delta, `/code-review` on `git diff <last-reviewed-sha>..HEAD`); the findings are recorded with their proofs in `## Review`, and the push and close gates block until `review` is ticked with the recording commit | `review`, `close-out`, `push-pr`   | pending |
| 2   | Explicit permission for the single `git push` of `feat/close-workflow-redesign` (rule 06, decision 031); the AI then opens the PR                                                                                                                                                                                                                               | `push-pr`                          | pending |
| 3   | After the PR's first CI run, add the `workflow-gate` job to the required checks of the `main` ruleset (a skipped job passes, so it is safe to add); until then the CI backstop for `git push --no-verify` is not blocking                                                                                                                                       | making the CI backstop hard        | pending |
| 4   | Know that after the merge the new flow applies: `merge` is yours, `deploy-check` is post-merge and non-blocking (the AI reports `deploy.yml` in chat; a failed deploy is a new task, never a reopened one)                                                                                                                                                      | nothing, awareness of the new flow | info    |
| 5   | `button-system`, `css-tailwind-first` and `workflow-integrity-hardening` stay `todo` in the backlog; the latter's item 6 now only owes the proactive `/code-review` nudge wording and an effort-level minimum                                                                                                                                                   | nothing                            | info    |

## Decisions made in this task

- → `.claude/docs/decisions/057-close-out-before-single-push.md` (with its `Amendment 2026-10-05`,
  `Amendment 2026-10-06`, `Amendment 2026-10-06 (second review)` and
  `Amendment 2026-10-06 (third review: findings become tests, search first)`)
