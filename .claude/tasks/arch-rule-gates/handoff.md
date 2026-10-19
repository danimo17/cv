# Handoff: arch-rule-gates

_Updated: 2026-10-19 13:10. REAL state of the `feat/arch-rule-gates` branch._

## Workflow progress

- [x] story — evidence: bb1e85e (story.md committed)
- [x] contract — evidence: bb1e85e (contract.md, criteria 1-6, committed)
- [x] build — evidence: f5a2bfd (test isolation fix) and 54d84e4 (five specs, violations fixed); specs written red first, see Done
- [x] consolidate — evidence: pre-commit `pnpm gate` at 54d84e4: Test Files 31 passed (31), Tests 611 passed (611)
- [x] validate — evidence: 2026-10-19 pnpm gate (format:check clean, eslint 0 errors / 1 pre-existing warning, nuxt typecheck clean, 611 tests) and gate:push run, see Validation
- [x] handoff — evidence: 2026-10-19 this file written and committed after 54d84e4
- [x] commit — evidence: 54d84e4
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- Criterion 1: `tests/arch/no-code-comments.spec.ts`. Red on the base tree: 1 violation, `// @ts-check` at the top of `eslint.config.mjs` (removed; decision 060 covers the rule-11 requirement). Green after.
- Criterion 2: `tests/arch/no-lint-suppressions.spec.ts`. The base tree had 0 suppressions, so it was born green; a second test proves the pattern matches every forbidden directive.
- Criterion 3: `tests/arch/language.spec.ts`. Red on the base tree: 51 hits in 19 files (workflow YAML comments, `.env.example`, `wrangler.jsonc`, `.gitignore`, `.claude/hooks/require-contract.sh` header, nine test titles/comments, quoted Catalan in `button-system` and `workflow-integrity-hardening` stories and in this task's own contract); all translated to English. Whole-file allowlist of 6 entries, each with its reason inline (the spec, decisions 040 and 043, `nuxt.config.ts`, the two CV data tables). Two heuristic false positives were fixed in the heuristic itself before allowlisting anything (the English words "sense" and "majors").
- Criterion 4: `tests/arch/no-internal-resources.spec.ts`. 0 real violations on the base tree; it found 3 quotes of its own markers (1 in this task's contract, 2 in the new docs), reworded. A sample per marker proves it matches, and `https://www.pdpaola.com` (public CV fact) stays unmatched.
- Criterion 5: `tests/arch/rules-enforced-by-tests.spec.ts`. Red with rule files, hard-rules table and backlog stashed (2 failures), green with them; rules 02, 13, 14, 15 "How it's checked", the `hard-rules.md` Enforced-by cells and the backlog row `arch-no-comments-no-suppressions` (now `done`) updated.
- Criterion 6: `pnpm test:arch` and `pnpm gate:push` green, see Validation.
- Found while building: the pre-commit gate inside a linked worktree made the specs that build throwaway repos write into the real repository (stray `seed`/`review`/`base` commits on the checked-out branch, branches `feat/demo`, `chore/x`, `feat/other`, and a shared `core.hooksPath` pointed at a temp dir). Fixed with `tests/setup/clean-git-env.ts` (vitest `setupFiles`) plus `tests/arch/test-env-isolation.spec.ts` (red with `GIT_DIR` set, green after). Details in decision 060 and the catalog.
- Catalog `ai-workflow.md` has blocks for the setup file and the five specs (rule 07).

## In progress / not done

- Review (`/code-review`) not run yet; close-out, gate-push and push-pr are intentionally unticked.
- Stray state from the leak in the shared repository was seen mid-task (branches `feat/demo`, `chore/x`, `feat/other`, junk commits on `feat/orphan-refs-and-scope`, and the shared `core.hooksPath` repointed at a temp dir several times while sibling worktrees ran their gates). At the last check the junk branches were gone and `core.hooksPath` was `.githooks`; this task only repaired its own branch and reset `core.hooksPath` when noticed. The siblings carry the leak until they take `tests/setup/clean-git-env.ts` from this branch.

## Subagents (rule 12)

| Subagent        | What it did                                                                  | Result                         |
| --------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| arch-rule-gates | whole task as executor: specs, violation fixes, rule files, catalog, backlog | 4 commits, criteria 1-6 closed |

## Validation (actual output of the last gate)

```
pnpm gate (pre-commit at 54d84e4) → Test Files 31 passed (31), Tests 611 passed (611); eslint: 0 errors, 1 warning (CustomInput.vue vue/require-default-prop, pre-existing); format:check and nuxt typecheck clean
pnpm gate:push → exit 0; build complete; playwright: 5 passed (14.5s)
```

Not covered: the language check is a heuristic (letters, a word list, function-word runs); English text with a foreign proper name needs an allowlist entry. Comments inside Vue template expressions and inside `.json`/`.jsonc` files are not scanned (the contract limits the scan to scripts, styles and `<!-- -->`). `wrangler.jsonc` comments were translated, not removed (outside the four root config files of rule 14's scan). Rule 02 stays human review for copied code.

## Review (workflow step `review`, rule 09)

Pending. The user runs `/code-review high` over the whole branch diff next; the checklist and the findings get recorded here afterwards, and the `review` progress line is ticked with the sha of the commit that records them.

## Pending on the user

| #   | What                                                                                                             | Blocks  | Status  |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| 1   | Run `/code-review high` over the branch diff                                                                     | review  | pending |
| 2   | Merge order: the siblings need `tests/setup/clean-git-env.ts` (this branch) before their next gate in a worktree | cleanup | pending |

## Decisions made in this task

- → `.claude/docs/decisions/060-arch-rule-gates.md`
