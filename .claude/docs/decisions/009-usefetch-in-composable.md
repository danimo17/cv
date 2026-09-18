# 009 · useFetch in the composable (SUPERSEDED by 029)

**Context.** `useFetch` and Pinia need to be demonstrated. The architecture doc says "every call goes through the store", but `useFetch` is a setup composable, not a store action.
**Decision.** `app/composables/useGiphySearch.ts` does the `useFetch` to `/api/giphy/search`. The `hero` store only holds the chosen meme and the history. The page (view) connects the two.
**Consequences.** Boundary documented in `docs/standards/state.md`; architecture test 03.

**Status.** Superseded on 2026-09-14 by decision 029 (Service → Store → View layers).
