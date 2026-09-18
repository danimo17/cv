# Standard · State, services and data (decision 029)

```
Giphy API ──► server/api/giphy/search.get.ts (API)
              ──► app/services/giphy/GiphyService.ts (Service: defines the request, normalizes errors)
              ──► app/stores/giphy.ts (Store: query/items/status/errorKey + search action)
              ──► app/pages/meme.vue (thin View) ──► meme/ and cv/ components (read stores/hero)
app/ui-config/cv/sections.ts (UI-config) ──► pages/index.vue + cv/ components
app/domain/cv (types + pure rules)  ·  app/data/cv (tables)  ·  app/composables (framework helpers)
```

One-way dependency: a layer only imports from the layers to its left. No component or page
calls a service or `/api/*` directly; no service knows about a store; no store knows about a component.

- **Server** (`server/api`, `server/utils`): validates input (trust boundary), hides the key, normalizes the
  response to `Meme` (`shared/types/giphy.ts`), caches. Errors: 400 input, 503 missing key, 502 upstream (never the raw response).
- **Service** (`app/services/<api>/<Name>Service.ts`): one class per API with a single exported
  instance (`giphyService`). Defines the request (`useFetch` with `immediate: false`, `watch: false` via `createSearch`) and is
  the ONLY place that translates an HTTP error into the user-facing i18n message key (`toUserErrorKey`). Stateless.
  Explicit import (`~/services/…`), not auto-import. Rule 03: `/api/giphy` only here.
- **Pinia store** (`app/stores/*.ts`, setup stores, auto-import): application state. `useGiphyStore` creates the
  service handle in setup (once) and exposes `items`, `status`, `error`, `errorKey` and the `search()`
  action. `useHeroStore` holds the chosen meme and its history. No persistence (decision 004).
- **View** (`pages/*.vue`): composes components and delegates to the stores; contains no business rules or
  HTTP calls. `pages/index.vue` iterates `homeSections` (UI-config) in order; `pages/meme.vue` wires up
  `useGiphyStore` and `useHeroStore`.
- **UI-config** (`app/ui-config/<entity>/*.ts`): declarative configuration (home sections: id, component,
  icon, title/eyebrow keys). Explicit import. No logic.
- **Domain** (`app/domain/<entity>/`): types (`types.ts`) and pure, framework-free functions (`formatPeriod`).
  Explicit import; tested in `node`.
- **Static data** (`app/data/cv/*.ts`, re-exported from `index.ts`): non-translatable facts (ISO dates, companies, URLs,
  tags, `profile`). Text goes through i18n with the key `<section>.items.<id>.*`.
- **Composables** (`app/composables/`, auto-import): helpers that need the framework but are not application
  state (`useMessageList` for i18n arrays). Never a `useFetch` (decision 029).
- **Preferences**: theme → `useColorMode()` (module, localStorage); language → `useI18n()` + cookie (module).
- **Loading**: the page decides. The grid shows skeletons while `status === 'pending'`; the rest of the
  page stays interactive. Errors are shown with the key the store provides (`errorKey`).
- **Catalog.** Every store/service/composable/domain function/ui-config export → `.claude/docs/catalog/state.md`
  (`### name` block, `tests/arch/docs-sync.spec.ts`).
