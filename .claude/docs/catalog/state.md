# Catalog · State, services, domain, data and UI-config

Layers (decision 029), one-way dependency:

```
server/api/giphy (API) ◄── app/services/giphy (Service) ◄── app/stores (Store) ◄── app/pages + components (View) ◄── app/ui-config (UI-config)
app/domain/cv (types and pure rules)  ·  app/data/cv (tables)  ·  app/composables (framework helpers)
```

`tests/arch/docs-sync.spec.ts` requires a `### name` block for every store, composable, util, service class,
exported function in `domain/` and export from `ui-config/`.

## Stores (`app/stores/`, Pinia setup stores, auto-import)

### useHeroStore

`app/stores/hero.ts`, id `hero`.

|             |                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| State       | `selected: Meme \| null` (meme the hero is "wearing"), `history: Meme[]` (last 5 selected, no duplicates) |
| Getters     | `hasMeme: boolean`                                                                                        |
| Actions     | `select(meme)` → selected + history; `reset()` → selected = null (history is kept)                        |
| Persistence | none (decision 004: kept in memory on purpose)                                                            |
| Consumers   | `HeroSection` (reads + reset), `pages/meme.vue` (select/reset)                                            |

### useGiphyStore

`app/stores/giphy.ts`, id `giphy`. The only place where the `useFetch` is created (via `giphyService.createSearch`, in the
store's setup, inside the Nuxt context of the first view that calls it).

|             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State       | `query: string` (trimmed), `limit: number` (`DEFAULT_GIPHY_LIMIT = 12`), `offset: number` (current page, 0 = first), `items: Meme[]` (computed from `data.items`), `total: number` (computed from `data.total`, defaults to `0`), `status: AsyncDataRequestStatus`, `error`, `errorKey: string` (computed: `''` if there is no error; otherwise `giphyService.toUserErrorKey(error)`), `history: string[]` (last 5 searched terms, most recent first, no duplicates — decision 034; **not** the same concept as `hero.history`) |
| Actions     | `search(q)` → trims, ignores empty values, resets `offset` to `0`, updates `history` (dedupe + `slice(0,5)`), `execute()`; `goToOffset(newOffset)` → changes `offset` (same `query`) and `execute()`, without touching `history`                                                                                                                                                                                                                                                                                                |
| Persistence | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Consumers   | `pages/meme.vue` (`items`, `status`, `errorKey`, `query`, `total`, `offset`, `history`, `search`, `goToOffset`)                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Test        | `tests/unit/stores/giphy.spec.ts` (`registerEndpoint` simulating 200/400/503 depending on `q`; covers `history` dedupe/max 5/order)                                                                                                                                                                                                                                                                                                                                                                                             |

## Services (`app/services/`, explicit import)

### GiphyService

`app/services/giphy/GiphyService.ts`, a class with a single exported instance `giphyService`. Stateless.
The only place on the client that knows about `/api/giphy/*` (rule 03, `tests/arch/giphy-boundary.spec.ts`).

| Method           | Signature                                                                                                               | Does                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `createSearch`   | `(query: Ref<string>, limit: Ref<number> \| number, offset: Ref<number> \| number = 0) → useFetch<GiphySearchResponse>` | defines the request to the search route (including `offset`, decision 034) with `immediate: false`, `watch: false`; doesn't execute it |
| `toUserErrorKey` | `(error: { statusCode?: number } \| null \| undefined) → string`                                                        | 400 → `meme.results.badQuery`, 503 → `meme.results.notConfigured`, other → `meme.results.error`                                        |

Test: `tests/unit/services/GiphyService.spec.ts`.

## Composables (`app/composables/`, auto-import)

### useMessageList

`useMessageList(key: MaybeRefOrGetter<string>): ComputedRef<string[]>`. Reads an i18n key that is an array
(`tm` + `rt`) and returns the resolved messages; `[]` if the key isn't an array. Avoids the recursive typing of
`Parameters<typeof rt>` (TS2589). Consumers: `ExperienceItem` (bullets), `pages/meme.vue` (`meme.how.steps`).

## Domain (`app/domain/cv/`, explicit import, no framework)

### formatPeriod

`app/domain/cv/period.ts`. `formatPeriod(start, end, locale, presentLabel)` → `"Oct 2023 – Present"`.
`start`/`end` in `YYYY-MM` or `YYYY`; `end === null` = present; `end === undefined` = a single date. A pure function using
`Intl.DateTimeFormat`. Test: `tests/unit/domain/period.spec.ts`. Consumer: `ExperienceItem`.

### Domain types

`app/domain/cv/types.ts` → `Section` (`experience | education | certifications`), `TimelineItem` (`id`, `section`,
`org`, `url?`, `location?`, `start`, `end?`, `tags`), `StackGroup` (`id`, `icon`, `items`).

## Data (`app/data/cv/`, explicit import from `~/data/cv`)

### Static data

Hardcoded tables, with no translatable text (text lives in i18n under the key `<section>.items.<id>.{title,bullets|note}`):

| File            | Export                                        | Content                                                             |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| `profile.ts`    | `profile`                                     | name, email, GitHub, LinkedIn, `repo`, language codes, interest ids |
| `experience.ts` | `experience: TimelineItem[]`                  | jobs                                                                |
| `education.ts`  | `education`, `certifications: TimelineItem[]` | education and certificates                                          |
| `stack.ts`      | `stack: StackGroup[]`                         | stack groups (id, icon, items)                                      |
| `index.ts`      | re-export of everything                       | `import { profile, stack } from '~/data/cv'`                        |

Rule 04: `tests/arch/no-pii.spec.ts` scans `app/data/cv/*.ts`.

## UI-config (`app/ui-config/`, explicit import)

### homeSections

`app/ui-config/cv/sections.ts`. `readonly HomeSectionConfig[]` with the home page order:
`{ id, component, icon, titleKey, eyebrowKey }` for `about`, `experience`, `stack`, `education`, `contact`.
`pages/index.vue` iterates this array and renders `component` using an explicit import map (no
dynamic `resolveComponent`).

### getSectionConfig

`getSectionConfig(id: HomeSectionId): HomeSectionConfig`. Each `cv/*` section reads its own entry to pass
`id`, `title`, `eyebrow` and `icon` to `CustomSection`. Throws if the id doesn't exist.

## Server (`server/`)

- `server/utils/giphy.ts`: `parseSearchQuery` (validation: q 1-50 chars with no control chars, limit 1-25 default 12, offset 0-4999; throws `GiphyQueryError`), `toMeme` (normalizes a Giphy GIF into a `Meme`).
- `server/api/giphy/search.get.ts`: handler cached for 1 h; 400 for an invalid query, 503 with no key, 502 upstream error.

## Shared types

`shared/types/giphy.ts` → `Meme`, `GiphySearchResponse` (server and client via `#shared/types/giphy`).
`app/types/ui.ts` → `Tone`, `Size`, `TONES`, `SIZES`. The CV types live in `app/domain/cv/types.ts`.
