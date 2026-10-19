# Handoff: arch-rule-gates

_Updated: 2026-10-19 15:00. REAL state of the `feat/arch-rule-gates` branch._

## Workflow progress

- [x] story — evidence: 95a0f8c (story.md committed)
- [x] contract — evidence: 95a0f8c (contract.md, criteria 1-6, committed; criteria 2, 3 and 5 reworded by 89a66d1 after the review)
- [x] build — evidence: d7aa791 (test isolation fix) and 30abfca (five specs, violations fixed), then the review fixes f7925f1, c5f7da0, 9b1428d, 89a66d1, 4cda77f and 5aec19e; every spec was written red first, see Done
- [x] consolidate — evidence: pre-commit `pnpm gate` at 5aec19e: Test Files 31 passed (31), Tests 626 passed (626)
- [x] validate — evidence: 2026-10-19 pnpm gate (format:check clean, eslint 0 errors / 1 pre-existing warning, nuxt typecheck clean, 626 tests) at 5aec19e, see Validation
- [x] handoff — evidence: 89e26bd (first handoff), rewritten for the review round by the commit that records the review
- [x] commit — evidence: 5aec19e
- [x] review — evidence: 8cf84c3 (the commit that recorded the high-effort `code-review` round of 2026-10-19 in `## Review`: findings r1-1 to r1-12, each with outcome and proof; no code change after it)
- [ ] close-out — evidence:
- [x] gate-push — evidence: pnpm gate:push on 5aec19e (2026-10-19, real log read, EXIT=0; the code tree is identical at the tip, only `.claude/` changed since): Test Files 31 passed (31), Tests 626 passed (626), nuxt build "Build complete!", e2e 5 passed (12.4s)
- [ ] push-pr — evidence:

## Done (verified)

- Criterion 1: `tests/arch/no-code-comments.spec.ts`. The scanner is a small tokenizer; fixes from the review: identifiers that end in a keyword or hold `_`, `$` or digits are not regex starts (`list_of / 2 // note` is reported), `)`, `]` and `}` are division preceders, the opening `<script>`/`<style>` tag is parsed with quoted attribute values, and the functional `// @ts-check` pragma is restored as the first line of `eslint.config.mjs` with the scanner exempting exactly that line in the four root config files (decision 060 amended). The scanner misses were checked red against the previous scanner (a stripped copy run with node: all three missed the comment), then green.
- Criterion 2: `tests/arch/no-lint-suppressions.spec.ts` now scans every tracked file, `tests/` and `e2e/` included (rule 15 says "anywhere"); only markdown under `.claude/` (documentation prose quoting the directives) and the lockfile are exempt. The spec builds its own samples from fragments, so no test file needs an exemption. Scanning the tests found the spec's own directive list: fixed by building it from fragments, and the same for one fixture in `no-code-comments.spec.ts`.
- Criterion 3: `tests/arch/language.spec.ts`, redesigned: a line is flagged on a Catalan/Spanish letter or on two distinct words from a curated stopword list (no English words, no locale codes, no content words, nothing copied from the original violations). The allowlist is per token (exact proper names, masked only in the named files); the spec itself is the one whole-file exception. Tests: English false positives (`tens`, `hem`, `fins`, a `para` variable, `que`) stay unflagged, an unaccented Catalan sentence is caught, a masked proper name does not hide new prose. The original run found 51 hits in 19 files, all translated.
- Criterion 4: `tests/arch/no-internal-resources.spec.ts`, unchanged in behavior (file list computed once per spec).
- Criterion 5: `tests/arch/rules-enforced-by-tests.spec.ts`: each of rules 02, 13, 14, 15 names its spec in its own "How it's checked" and in its own `hard-rules.md` row (a spec named only in another rule's row does not count); the transient backlog row status is no longer asserted; every `decision NNN` cited by the four specs must exist (the first version cited a non-existent decision 059).
- Criterion 6: `pnpm test:arch` and `pnpm gate:push` green, see Validation.
- Test isolation: `tests/setup/clean-git-env.ts` exports `scrubGitEnv(env)` and calls it on import; the list covers the repository-redirecting git variables and also the `GIT_AUTHOR_*`/`GIT_COMMITTER_*` overrides (they beat the fixtures' `git config user.*`); `tests/arch/test-env-isolation.spec.ts` unit-tests the function with fake environments and asserts that `vitest.config.ts` registers the file in `setupFiles`.
- Shared helper: `tests/arch/support/repo-files.ts` is reused by `secrets.spec.ts` (its own `gitFiles()` is gone; behavior unchanged, now guarded against an empty listing), spec files no longer export helpers, and every spec computes the file list once at module level.
- Catalog `ai-workflow.md` and decision 060 describe all of the above (rule 07).

## In progress / not done

- Review round 1 is recorded below (8cf84c3); gate:push ran green on the final code; the close-out commit follows as the last commit, push-pr stays unticked until the push and the PR exist.
- Stray state from the earlier leak in the shared repository was seen mid-task (branches `feat/demo`, `chore/x`, `feat/other`, junk commits on `feat/orphan-refs-and-scope`, and the shared `core.hooksPath` repointed at a temp dir several times while sibling worktrees ran their gates). The authors of this branch's commits were fixed and its history rewritten earlier (the old evidence shas bb1e85e, f5a2bfd, 54d84e4, d2faffc and 0a6438a became 95a0f8c, d7aa791, 30abfca, 89e26bd and f430c1f); the shared config was verified at every gate run of this round (`core.bare=false`, `core.hooksPath=.githooks`, user `danimo17`). The siblings carry the leak until they take `tests/setup/clean-git-env.ts` from this branch.

## Subagents (rule 12)

| Subagent                | What it did                                                                                                      | Result                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| arch-rule-gates         | whole task as executor: specs, violation fixes, rule files, catalog, backlog                                     | 4 commits, criteria 1-6 closed   |
| read-only reviewer      | high-effort `/code-review` of the whole branch diff, 2026-10-19                                                  | numbered findings, none executed |
| arch-rule-gates (round) | applied the review findings tests-first, queued two limits, recorded the review, ran gate:push and the close-out | 6 commits before the review      |

## Validation (actual output of the last gate)

```
pnpm gate (pre-commit at 5aec19e) → format:check clean; eslint: 0 errors, 1 warning (CustomInput.vue vue/require-default-prop, pre-existing); nuxt typecheck clean; Test Files 31 passed (31), Tests 626 passed (626)
pnpm gate:push at 5aec19e (2026-10-19, real log read) → format:check clean, eslint 0 errors / 1 warning, typecheck clean, Test Files 31 passed (31), Tests 626 passed (626), nuxt build "Build complete!", playwright 5 passed (12.4s), EXIT=0
```

Not covered: the language check is a heuristic (letters and curated stopword pairs; one foreign word, or a foreign sentence with fewer than two stopwords, passes; queued as `workflow-integrity-hardening` item 10). Comments inside Vue template expressions and inside `.json`/`.jsonc` files are not scanned (queued as `workflow-integrity-hardening` item 9; the contract limits the scan to scripts, styles and `<!-- -->`). `wrangler.jsonc` comments were translated, not removed (outside the four root config files of rule 14's scan). Rule 02 stays human review for copied code.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (no `app/` change; code outside `tests/` and `.claude/` is `eslint.config.mjs`, workflow YAML comments, `.env.example`, `.gitignore`, `wrangler.jsonc`, `vitest.config.ts`):

- [x] Secrets (01, `secrets.spec.ts` green), company (02, `no-internal-resources.spec.ts` green, sources declared in the contract), Giphy boundary (03), PII (04) and i18n (05) untouched; branch (06) `feat/arch-rule-gates`; catalog (07) `ai-workflow.md` updated for every spec and the setup file, `docs-sync.spec.ts` green; CSS and primitives (08, 026, 038), accessibility and UI consistency (16) n/a (no component or style changed); gates (09) `pnpm gate` green, output in Validation; contract (10) criteria 1-6 each with a named test; decisions (11) decision 060 amended for the language redesign, the pragma and the isolation list; subagents (12) table above

`code-review` result: high effort, 2026-10-19, round 1, run by a read-only reviewer agent at the user's request over the whole branch diff. The findings below were each opened and confirmed before acting, fixed tests first (red then green; the order is in the commits f7925f1, c5f7da0, 9b1428d, 89a66d1, 4cda77f, 5aec19e), and are proven by the named tests. Every `new` proof names a spec created on this branch or a title that is not at the base ref; `strengthened` is used only for `secrets.spec.ts`, which exists at the base.

- finding r1-1 — outcome: fixed — proof: new tests/arch/rules-enforced-by-tests.spec.ts › decisions cited by the rule specs exist — searched: cited by the rule specs
- finding r1-2 — outcome: fixed — proof: new tests/arch/language.spec.ts › English false positives stay unflagged — searched: false positives
- finding r1-3 — outcome: fixed — proof: new tests/arch/language.spec.ts › an allowlisted proper name is masked but new prose around it is still flagged — searched: allowlisted, proper name
- finding r1-4 — outcome: fixed — proof: new tests/arch/no-lint-suppressions.spec.ts › tests and e2e are scanned and only .claude markdown prose is exempt — searched: markdown prose, e2e are scanned
- finding r1-5 — outcome: fixed — proof: new tests/arch/rules-enforced-by-tests.spec.ts › the hard-rules.md row of each rule names the same spec — searched: hard-rules.md row
- finding r1-6 — outcome: fixed — proof: new tests/arch/test-env-isolation.spec.ts › scrubGitEnv removes every variable that redirects or re-identifies a git call — searched: scrubGitEnv removes
- finding r1-7 — outcome: fixed — proof: new tests/arch/no-code-comments.spec.ts › identifiers that end in a keyword or hold digits, underscores and dollars are not regex starts — searched: end in a keyword, underscores
- finding r1-8 — outcome: fixed — proof: new tests/arch/no-code-comments.spec.ts › a script tag with a greater-than sign in an attribute value is parsed to the real end of the tag — searched: greater-than sign
- finding r1-9 — outcome: fixed — proof: new tests/arch/no-code-comments.spec.ts › only the exact type-check pragma on the first line of a root config file is exempt — searched: exact type-check
- finding r1-10 — outcome: fixed — proof: strengthened tests/arch/secrets.spec.ts › no dotenv file is tracked or untracked-unignored
- finding r1-11 — outcome: queued — proof: workflow-integrity-hardening item 9 (comments inside Vue template expressions are not scanned by the comment scanner; a documented limit, severity low)
- finding r1-12 — outcome: queued — proof: workflow-integrity-hardening item 10 (the language check stays a heuristic; severity low, accepted limit)

## Pending on the user

| #   | What                                                                                                             | Blocks  | Status  |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| 1   | Permission for the single push of `feat/arch-rule-gates` and the PR (rule 06, decision 031)                      | push-pr | pending |
| 2   | Merge order: the siblings need `tests/setup/clean-git-env.ts` (this branch) before their next gate in a worktree | cleanup | pending |

## Decisions made in this task

- → `.claude/docs/decisions/060-arch-rule-gates.md` (amended 2026-10-19: language redesign, per-token allowlist, suppression scan scope, `// @ts-check` pragma, wider git env scrub)
