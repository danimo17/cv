# Contract: arch-rule-gates

**Story:** `story.md` · **Declared data sources (rule 02):** none (repo-internal tests only).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                                                                 | Test that covers it                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Given every file under `app/`, `server/`, `shared/` and the root config files (`nuxt.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`), When scanned, Then none contains a `//` or `/* */` comment (code) or `<!-- -->` (Vue templates); the only allowed exceptions are the exact `// #region <Name>` / `// #endregion` markers in composables and Pinia stores (rule 14, decision 052) | `tests/arch/no-code-comments.spec.ts` › "app, server, shared and root config are comment-free"            |
| 2   | Given the same tree plus `tests/` and `e2e/`, When scanned for `eslint-disable`, `@ts-expect-error`, `@ts-ignore`, `@ts-nocheck`, Then none exists outside `tests/` and `e2e/` (rule 15)                                                                                                                                                                                                                            | `tests/arch/no-lint-suppressions.spec.ts` › "no lint or type suppressions outside tests"                  |
| 3   | Given every tracked text file outside `i18n/locales/`, When scanned, Then it has no Catalan/Spanish letters (`ç`, `ñ`, inverted punctuation, accented-vowel-heavy words) nor common ca/es stopwords in prose beyond an explicit, justified allowlist kept inside the spec (proper names, CV data tables); `.claude/` docs included (rule 13)                                                                        | `tests/arch/language.spec.ts` › "files outside i18n locales are English"                                  |
| 4   | Given tracked files, When scanned for internal-resource markers (`atlassian.net`, Jira/Confluence ticket URLs, `slack.com/archives`, private-org GitHub URLs, internal-looking hostnames), Then none appears; the public CV facts in `app/data/cv/` are unaffected (rule 02)                                                                                                                                        | `tests/arch/no-internal-resources.spec.ts` › "no internal company resources are referenced"               |
| 5   | Given rules 02, 13, 14, 15, When read, Then each rule file's "How it's checked" names its spec file, that file exists, and the backlog rows `arch-no-comments-no-suppressions` is `done`                                                                                                                                                                                                                            | `tests/arch/rules-enforced-by-tests.spec.ts` › "rules 02, 13, 14 and 15 name the spec that enforces them" |
| 6   | Given the new specs, When run on the current tree, Then they pass because the violations they found were fixed (comments removed, text translated or allowlisted with a reason), with no behavior change                                                                                                                                                                                                            | `pnpm test:arch` + `pnpm gate:push` green                                                                 |

## Subagent assignments (rule 12)

| Subagent        | Scope                                                                                | Criteria |
| --------------- | ------------------------------------------------------------------------------------ | -------- |
| arch-rule-gates | the four specs, fixing the violations they uncover, rule files, catalog, backlog row | 1-6      |

## Standards to consult

- `.claude/docs/standards/testing.md`, `.claude/docs/standards/code-style.md`, decisions 041 and 052

## Open questions (each with a destination)

- Heuristic precision for criterion 3 (false positives on names) → decided: allowlist inside the spec, each entry with a reason; record in a decision if the allowlist exceeds ~10 entries.
