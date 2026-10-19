# Close checklist: arch-rule-gates

Closed on the feature branch `feat/arch-rule-gates` before the single push (decision 057), on 2026-10-19, as the last
commit of the branch. Verified on the tree of `5ad87ac` (the last commit before this one; its code tree is identical to
`5aec19e`, the last code commit, because only `.claude/` changed after it). The merge and the post-merge deploy check are
not archived: the deploy check is reported in chat after merge. The only open line is `push-pr`.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (6 criteria). `pnpm test:arch` and the
      whole suite ran inside `pnpm gate:push` on `5aec19e`: `Test Files  31 passed (31)`, `Tests  626 passed (626)`. The
      criteria and the test that proves each:
  - [x] 1. `tests/arch/no-code-comments.spec.ts` › "app, server, shared and root config are comment-free" (plus the scanner tests added by the review: keyword-suffixed identifiers, script tags with ">" in an attribute value, and the first-line `// @ts-check` pragma exemption)
  - [x] 2. `tests/arch/no-lint-suppressions.spec.ts` › "no lint or type suppressions anywhere" (scans `tests/` and `e2e/` too; only `.claude/` markdown prose is exempt)
  - [x] 3. `tests/arch/language.spec.ts` › "files outside i18n locales are English" (letter or two distinct stopwords per line; per-token allowlist)
  - [x] 4. `tests/arch/no-internal-resources.spec.ts` › "no internal company resources are referenced"
  - [x] 5. `tests/arch/rules-enforced-by-tests.spec.ts` › "rules 02, 13, 14 and 15 name the spec that enforces them" and "the hard-rules.md row of each rule names the same spec"
  - [x] 6. `pnpm test:arch` and `pnpm gate:push` green on `5aec19e` (violations found by the specs were fixed: 51 language hits in 19 files and one `// @ts-check` pragma, the latter restored by the review as the one functional exemption)
- [x] `pnpm gate:push` real output confirmed green, read from the actual log (not a task-notification exit code), run
      2026-10-19 on `5aec19e`: `All matched files use Prettier code style!`, lint `1 problem (0 errors, 1 warning)` (the
      pre-existing `vue/require-default-prop` in `CustomInput.vue`), `nuxt typecheck` ok, `Test Files  31 passed (31)`,
      `Tests  626 passed (626)`, `Build complete!`, playwright `5 passed (12.4s)`, final `EXIT=0`.
- [x] `/code-review` ran over the whole branch diff: `code-review` at high effort, 2026-10-19, round 1, run by a
      read-only reviewer agent at the user's request; findings r1-1 to r1-12 are in `## Review` below with their outcome
      and proof (ten fixed with tests, two limits queued in `workflow-integrity-hardening`), all checked by the gate.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `060-arch-rule-gates.md` (amended
      2026-10-19 for the language redesign, the per-token allowlist, the suppression scan scope, the `// @ts-check`
      pragma and the wider git environment scrub).
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/`: no component, store, composable, token or class was created or changed; the five arch
      specs, the setup file `tests/setup/clean-git-env.ts` and the shared helper are in `.claude/docs/catalog/ai-workflow.md`
      (`tests/arch/docs-sync.spec.ts` is green in the 626 tests above).
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no code convention changed
      (no standard touched); the enforcement of rules 02, 13, 14 and 15 is in `.claude/rules/{02,13,14,15}-*.md` and
      `.claude/hard-rules.md` rows 02, 13, 14, 15.
- [x] No flagged/unresolved rule-11 conflict left open: the handoff's pending list holds only the permission for the
      single push (rule 06) and the merge order for the sibling tasks; the language-heuristic and template-comment
      limits were queued by the review policy (deliberate or accepted limits), not left as an open question.
- [x] `.claude/backlog.md` row for this task set to `done`, pointing at the branch `feat/arch-rule-gates` and this
      archive (the PR does not exist yet; no PR number is claimed).

## Review

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

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order; only `push-pr` is open (it is ticked after the push and the PR exist).

- [x] story — evidence: 95a0f8c (story.md committed)
- [x] contract — evidence: 95a0f8c (contract.md, criteria 1-6, committed; criteria 2, 3 and 5 reworded by 89a66d1 after the review)
- [x] build — evidence: d7aa791 (test isolation fix) and 30abfca (five specs, violations fixed), then the review fixes f7925f1, c5f7da0, 9b1428d, 89a66d1, 4cda77f and 5aec19e; every spec was written red first, see Done
- [x] consolidate — evidence: pre-commit `pnpm gate` at 5aec19e: Test Files 31 passed (31), Tests 626 passed (626)
- [x] validate — evidence: 2026-10-19 pnpm gate (format:check clean, eslint 0 errors / 1 pre-existing warning, nuxt typecheck clean, 626 tests) at 5aec19e
- [x] handoff — evidence: 89e26bd (first handoff), rewritten for the review round by the commit that records the review
- [x] commit — evidence: 5aec19e
- [x] review — evidence: 8cf84c3 (the commit that recorded the high-effort `code-review` round of 2026-10-19 in `## Review`: findings r1-1 to r1-12, each with outcome and proof; no code change after it)
- [x] close-out — evidence: 5ad87ac (the last commit before the close-out; the close-out commit is the last commit of the branch and cannot cite itself, its archive is `.claude/tasks/closed/arch-rule-gates.md`)
- [x] gate-push — evidence: pnpm gate:push on 5aec19e (2026-10-19, real log read, EXIT=0; the code tree is identical at the tip, only `.claude/` changed since): Test Files 31 passed (31), Tests 626 passed (626), nuxt build "Build complete!", e2e 5 passed (12.4s)
- [ ] push-pr — evidence:
