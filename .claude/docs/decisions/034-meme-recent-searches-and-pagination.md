# 034 · Meme history: "recent searches" + generic pagination

**Decision (D1 of the post-launch handoff).** The history isn't dropped: a UI is built for it. At the
bottom of `/meme` there's a "recent searches" section with at most 5 searched terms, each clickable;
clicking one fills the search field and runs the search. Additionally, Giphy paginates results: a
generic pagination component is created (`app/components/shared/CustomPagination.vue` once 038 is done)
and applied to the meme results list.
**Consequences.** `useGiphyStore` gains its own `history` of searched terms (list of strings, max 5, most
recent first) — this is **not** the same field as `useHeroStore`'s `history` (which stores memes "carried"
to the hero, decision 004; different concepts that share a name by coincidence). New generic pagination
component, reusable outside of memes. `GiphyService`/`useGiphyStore` gain an `offset` to make use of the
`total` that `/api/giphy/search` already returns. Catalog (`state.md`, `components.md`) and i18n (new keys
for "recent searches" and pagination) are updated in the same commit (rule 07).
