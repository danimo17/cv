# 052 · Fixed `#region` structure inside composables and stores

**Context.** The codebase's composables and Pinia stores had no fixed internal ordering — each file grouped
`ref`/`computed`/functions however felt natural. The user asked for a consistent, always-TypeScript internal
structure, using IDE-foldable `// #region` markers (VSCode/JetBrains both fold these natively), and for rule 14
(no code comments) to carry an explicit exception for exactly these markers — not comments in general.

**Decision.** Every composable (`app/composables/*.ts`) and Pinia store (`app/stores/*.ts`) is organized into
fixed, ordered `// #region <Name>` / `// #endregion` blocks. Empty regions are omitted (don't write
`// #region Lifecycle` around nothing). Full structure and exact region names in
`.claude/docs/standards/state.md`'s "Internal structure (regions)" section — summary:

- **Composables**: Static variables → Reactive variables → Methods → Component data → Lifecycle.
- **Stores**: State → Getters → Methods.

Only these exact marker comments are exempt from rule 14 — a region block still can't carry an explanatory
comment inside it.

**Consequences.** `app/stores/giphy.ts` and `app/stores/hero.ts` (the only 2 stores that exist today) were
retrofitted immediately as worked examples — small enough to do now rather than leave as a "next time" TODO.
`app/composables/useMessageList.ts` (the only composable today) is a single `computed` with no state, methods,
component data or lifecycle to separate — every region would be empty, so per the "omit when empty" rule it
carries none; it's still a correct example of the convention, just one with nothing to show. Every future
composable/store follows the same shape from the start.
