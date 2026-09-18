# 03 · Giphy boundary

**What.** `api.giphy.com` only appears in `server/`. The client talks to `/api/giphy/*` only from the
`app/services/giphy/GiphyService.ts` service layer (decision 029); the `useGiphyStore` store is its only
consumer and views only read the store. No component, page or composable does `useFetch`/`$fetch` to Giphy or
to `/api/giphy` directly.
**Why.** The key lives on the server (rule 01); a single entry point allows changing provider, caching,
validating and translating errors in one place.
**How it's checked.** `tests/arch/giphy-boundary.spec.ts` (`/api/giphy` only in `app/services/giphy/` and `server/`).
