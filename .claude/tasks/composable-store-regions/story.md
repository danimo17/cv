# Story: composable-store-regions

**As** the user, **I want** composables and Pinia stores organized into fixed, ordered `// #region` blocks
**for** a consistent, always-navigable internal structure across state-layer code.

## Scope

- Rule 14 gets a narrow exception for exactly `// #region <Name>` / `// #endregion` markers in
  `app/composables/*.ts` and `app/stores/*.ts` — not comments in general.
- `.claude/docs/standards/state.md` documents the exact region names and order:
  - Composables: Static variables → Reactive variables → Methods → Component data → Lifecycle.
  - Stores: State → Getters → Methods.
- Applied immediately to the only 3 files that exist today (`useMessageList.ts`, `giphy.ts`, `hero.ts`) as
  worked examples — small enough to do now, not deferred.

## Out of scope

- Any new automated lint rule enforcing region presence/order — human review for now, same as the rest of
  rule 14.

## External dependencies

None.
