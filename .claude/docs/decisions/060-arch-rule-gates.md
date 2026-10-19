# 060 · Rules 02, 13, 14 and 15 become arch specs (and the specs stop touching the real repo)

**Context.** Rules 02 (no company resources), 13 (English), 14 (no code comments) and 15 (zero lint suppressions)
were enforced by "human review" only, which is exactly what rule 19 forbids for an "ensure". Backlog row
`arch-no-comments-no-suppressions` (decision 041) and scope item 5 of `workflow-integrity-hardening` asked for the
mechanization. While building it, a running gate inside a linked worktree was found to corrupt the real
repository (see the last section).

**Decision.**

- `tests/arch/no-code-comments.spec.ts` (rule 14): a small tokenizer (strings, template literals, regex literals) over
  `app/`, `server/`, `shared/` and the four root config files; `//`, `/* */` in scripts and styles and `<!-- -->` in Vue
  templates fail. The only exception is the exact `// #region <fixed name>` / `// #endregion` marker in
  `app/composables/` and `app/stores/` (decision 052). One violation existed: `// @ts-check` at the top of
  `eslint.config.mjs` (a type-check pragma for the editor, no runtime effect), removed.
- `tests/arch/no-lint-suppressions.spec.ts` (rule 15): `eslint-disable`, `eslint-enable`, `@ts-expect-error`,
  `@ts-ignore`, `@ts-nocheck` fail in any tracked file outside `tests/`, `e2e/` and `.claude/` (the last quotes the
  directives while describing the rule). No violation existed.
- `tests/arch/language.spec.ts` (rule 13): three heuristics, no dictionary: Catalan/Spanish letters, words that are not
  English, and runs of three function words in one line. Found 51 hits in 19 files (workflow YAML comments, the
  `.env.example` and `wrangler.jsonc` comments, `.gitignore`, a hook header, test titles using the Catalan words for "decision" and "rule",
  quoted Catalan in two stories), all translated. Whole-file allowlist, six entries (below the ten that would
  force rethinking the heuristics): the spec itself, decision 040 (quotes the accented-vowel grep), decision 043 and
  `nuxt.config.ts` (the native language names of the locale switcher), and the CV data tables `education.ts` and
  `experience.ts` (proper names of schools, organizations and places). The user's wording is unchanged where it was
  a quote: only the language of the quote moved to English.
- `tests/arch/no-internal-resources.spec.ts` (rule 02): markers of internal systems fail in any tracked file
  (Atlassian cloud hosts, Jira ticket and Confluence URLs, Slack message URLs, GitHub URLs of the company organization, company
  sub-domains other than `www`, company e-mail addresses, `.internal`/`.intranet`/`.corp`/`.lan` hosts). The public
  `https://www.pdpaola.com` in `app/data/cv/` is deliberately not a marker. This is the checkable slice only;
  copied code or designs stay human review (rule 02 says so).
- `tests/arch/rules-enforced-by-tests.spec.ts`: the four rule files' "How it's checked" paragraph and each rule's own
  hard-rules.md row stay in sync with the specs above (the transient backlog row status is not asserted).
- Rule 16 (UI consistency) stays human review as a permanent exception: no generic automated check of visual
  consistency is realistic (rule 16 states it).

**Why `eslint.config.mjs` is touched.** Rule 14 covers root config files and the spec found the `// @ts-check` pragma
there; rule 11 requires a decision for any change to that file, which is this entry. No lint rule changed.

**Test isolation fix (found while building this).** `git` sets `GIT_DIR`, `GIT_INDEX_FILE` and friends for hooks;
in a linked worktree `GIT_DIR` is absolute, so the specs that create throwaway repos (`cwd: tmpdir`) wrote into the real
repository during the pre-commit gate: stray `seed`/`review`/`base` commits on the checked-out branch, `feat/demo`,
`chore/x` and `feat/other` branches, and `core.hooksPath` repointed at a temp directory in the shared config (which
silently turns every hook off for all worktrees). `tests/setup/clean-git-env.ts` (vitest `setupFiles`) exports `scrubGitEnv(env)` and deletes those variables (also
`GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_NAMESPACE`, `GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_COUNT`,
`GIT_CONFIG_KEY_<n>`/`GIT_CONFIG_VALUE_<n>`, and `GIT_AUTHOR_*`/`GIT_COMMITTER_*`: the identity variables do not
redirect the repository, but they override the `user.*` config the fixtures set, so they are removed too for
reproducible fixtures). `tests/arch/test-env-isolation.spec.ts` unit-tests the function with a fake environment and
asserts that `vitest.config.ts` registers the file in `setupFiles`. In the main checkout the variable is relative
(`.git`) and happened to be harmless, which is why it went unnoticed.

**Consequences.** A comment, a suppression, Catalan/Spanish text or an internal-system link now fails `pnpm gate` at
commit time. The language heuristic can produce a false positive on a legitimate foreign proper name: the answer is
an allowlist entry with its reason (never a weaker heuristic), and more than ten entries means revisiting this
decision.
