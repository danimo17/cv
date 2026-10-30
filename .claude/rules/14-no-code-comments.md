# 14 · No comments in code

**What.** Every file outside `.claude/` — components, composables, stores, services, domain, data,
ui-config, pages, plugins, server, shared types, and root config files (`nuxt.config.ts`, `eslint.config.mjs`,
`vitest.config.ts`, `playwright.config.ts`) — is comment-free: no `//`, no `/** */` JSDoc, no `<!-- -->` in
templates. Anything that would explain "why" belongs in `.claude/docs/standards/` or `.claude/docs/catalog/`
(rule 07) instead — never duplicated inline.

**Exceptions:**

- `tests/**` and `e2e/**` may keep comments where they clarify a test's setup or intent.
- Composables and Pinia stores may carry the fixed structural `// #region <Name>` / `// #endregion` markers
  described in `.claude/docs/standards/state.md`'s "Internal structure (regions)" — and only those exact
  markers, never a free-form explanatory comment riding along with them. This is decision 052.

**Why.** The catalog and standards are already the documented source of truth for what each artifact does
and why; a comment in code drifts from them over time and the public repo shouldn't carry two versions of
the same explanation.

**How it's checked.** `tests/arch/no-code-comments.spec.ts` tokenizes every `.ts`/`.mjs`/`.vue`/`.css` file under `app/`,
`server/`, `shared/` plus `nuxt.config.ts`, `eslint.config.mjs`, `vitest.config.ts` and `playwright.config.ts`, and
fails on any `//`, `/* */` or `<!-- -->`, except the exact `// #region <Name>` / `// #endregion` markers (fixed
region names) in `app/composables/` and `app/stores/`.
