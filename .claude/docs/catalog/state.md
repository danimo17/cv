# Catàleg · Estat, serveis, domini, dades i UI-config

Capes (decisió 029), dependència en un sol sentit:

```
server/api/giphy (API) ◄── app/services/giphy (Service) ◄── app/stores (Store) ◄── app/pages + components (View) ◄── app/ui-config (UI-config)
app/domain/cv (tipus i regles pures)  ·  app/data/cv (taules)  ·  app/composables (helpers de framework)
```

`tests/arch/docs-sync.spec.ts` exigeix un bloc `### nom` per a cada store, composable, util, classe de servei,
funció exportada de `domain/` i export de `ui-config/`.

## Stores (`app/stores/`, Pinia setup stores, auto-import)

### useHeroStore

`app/stores/hero.ts`, id `hero`.

|              |                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Estat        | `selected: Meme \| null` (meme que "porta" el hero), `history: Meme[]` (últims 5 seleccionats, sense duplicats) |
| Getters      | `hasMeme: boolean`                                                                                              |
| Accions      | `select(meme)` → selected + history; `reset()` → selected = null (history es manté)                             |
| Persistència | cap (decisió 004: en memòria a propòsit)                                                                        |
| Consumidors  | `HeroSection` (llegeix + reset), `pages/meme.vue` (select/reset)                                                |

### useGiphyStore

`app/stores/giphy.ts`, id `giphy`. Únic lloc on es crea el `useFetch` (via `giphyService.createSearch`, al setup
de la store, dins del context Nuxt de la primera vista que la crida).

|              |                                                                                                                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estat        | `query: string` (retallada), `limit: number` (`DEFAULT_GIPHY_LIMIT = 12`), `items: Meme[]` (computed de `data.items`), `status: AsyncDataRequestStatus`, `error`, `errorKey: string` (computed: `''` si no hi ha error; si no, `giphyService.toUserErrorKey(error)`) |
| Accions      | `search(q)` → retalla, ignora buides, `execute()`                                                                                                                                                                                                                    |
| Persistència | cap                                                                                                                                                                                                                                                                  |
| Consumidors  | `pages/meme.vue` (`items`, `status`, `errorKey`, `query`, `search`)                                                                                                                                                                                                  |
| Test         | `tests/unit/stores/giphy.spec.ts` (`registerEndpoint` que simula 200/400/503 segons `q`)                                                                                                                                                                             |

## Serveis (`app/services/`, import explícit)

### GiphyService

`app/services/giphy/GiphyService.ts`, classe amb una única instància exportada `giphyService`. Sense estat.
Únic lloc del client que coneix `/api/giphy/*` (regla 03, `tests/arch/giphy-boundary.spec.ts`).

| Mètode           | Signatura                                                                            | Fa                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `createSearch`   | `(query: Ref<string>, limit: Ref<number> \| number) → useFetch<GiphySearchResponse>` | defineix la petició a la ruta de cerca amb `immediate: false`, `watch: false`; no l'executa     |
| `toUserErrorKey` | `(error: { statusCode?: number } \| null \| undefined) → string`                     | 400 → `meme.results.badQuery`, 503 → `meme.results.notConfigured`, resta → `meme.results.error` |

Test: `tests/unit/services/GiphyService.spec.ts`.

## Composables (`app/composables/`, auto-import)

### useMessageList

`useMessageList(key: MaybeRefOrGetter<string>): ComputedRef<string[]>`. Llegeix una clau i18n que és un array
(`tm` + `rt`) i retorna els missatges resolts; `[]` si la clau no és un array. Evita el tipat recursiu de
`Parameters<typeof rt>` (TS2589). Consumidors: `ExperienceItem` (bullets), `pages/meme.vue` (`meme.how.steps`).

## Domini (`app/domain/cv/`, import explícit, sense framework)

### formatPeriod

`app/domain/cv/period.ts`. `formatPeriod(start, end, locale, presentLabel)` → `"Oct 2023 – Present"`.
`start`/`end` en `YYYY-MM` o `YYYY`; `end === null` = present; `end === undefined` = data única. Funció pura amb
`Intl.DateTimeFormat`. Test: `tests/unit/domain/period.spec.ts`. Consumidor: `ExperienceItem`.

### Tipus del domini

`app/domain/cv/types.ts` → `Section` (`experience | education | certifications`), `TimelineItem` (`id`, `section`,
`org`, `url?`, `location?`, `start`, `end?`, `tags`), `StackGroup` (`id`, `icon`, `items`).

## Dades (`app/data/cv/`, import explícit des de `~/data/cv`)

### Dades estàtiques

Taules hardcoded, sense text traduïble (el text va a i18n amb la clau `<section>.items.<id>.{title,bullets|note}`):

| Fitxer          | Export                                        | Contingut                                                               |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `profile.ts`    | `profile`                                     | nom, email, GitHub, LinkedIn, `repo`, codis d'idiomes, ids d'interessos |
| `experience.ts` | `experience: TimelineItem[]`                  | feines                                                                  |
| `education.ts`  | `education`, `certifications: TimelineItem[]` | formació i certificats                                                  |
| `stack.ts`      | `stack: StackGroup[]`                         | grups del stack (id, icona, items)                                      |
| `index.ts`      | re-export de tot                              | `import { profile, stack } from '~/data/cv'`                            |

Regla 04: `tests/arch/no-pii.spec.ts` escaneja `app/data/cv/*.ts`.

## UI-config (`app/ui-config/`, import explícit)

### homeSections

`app/ui-config/cv/sections.ts`. `readonly HomeSectionConfig[]` amb l'ordre de la home:
`{ id, component, icon, titleKey, eyebrowKey }` per a `about`, `experience`, `stack`, `education`, `contact`.
`pages/index.vue` itera aquest array i renderitza `component` amb un mapa explícit d'imports (no
`resolveComponent` dinàmic).

### getSectionConfig

`getSectionConfig(id: HomeSectionId): HomeSectionConfig`. Cada secció `cv/*` llegeix la seva entrada per passar
`id`, `title`, `eyebrow` i `icon` a `CustomSection`. Llença si l'id no existeix.

## Servidor (`server/`)

- `server/utils/giphy.ts`: `parseSearchQuery` (validació: q 1-50 chars sense control chars, limit 1-25 def. 12, offset 0-4999; llença `GiphyQueryError`), `toMeme` (normalitza un GIF de Giphy a `Meme`).
- `server/api/giphy/search.get.ts`: handler cachejat 1 h; 400 query invàlida, 503 sense clau, 502 upstream.

## Tipus compartits

`shared/types/giphy.ts` → `Meme`, `GiphySearchResponse` (servidor i client via `#shared/types/giphy`).
`app/types/ui.ts` → `Tone`, `Size`, `TONES`, `SIZES`. Els tipus del CV són a `app/domain/cv/types.ts`.
