# Standard · Estat, serveis i dades (decisió 029)

```
Giphy API ──► server/api/giphy/search.get.ts (API)
              ──► app/services/giphy/GiphyService.ts (Service: defineix la petició, normalitza errors)
              ──► app/stores/giphy.ts (Store: query/items/status/errorKey + acció search)
              ──► app/pages/meme.vue (View prima) ──► components meme/ i cv/ (llegeixen stores/hero)
app/ui-config/cv/sections.ts (UI-config) ──► pages/index.vue + components cv/
app/domain/cv (tipus + regles pures)  ·  app/data/cv (taules)  ·  app/composables (helpers de framework)
```

Dependència en un sol sentit: una capa només importa de les capes de la seva esquerra. Cap component ni pàgina
crida un servei ni `/api/*` directament; cap servei coneix una store; cap store coneix un component.

- **Server** (`server/api`, `server/utils`): valida l'entrada (trust boundary), amaga la clau, normalitza la
  resposta a `Meme` (`shared/types/giphy.ts`), cacheja. Errors: 400 entrada, 503 sense clau, 502 upstream (mai la resposta crua).
- **Service** (`app/services/<api>/<Nom>Service.ts`): una classe per API amb una única instància exportada
  (`giphyService`). Defineix la petició (`useFetch` amb `immediate: false`, `watch: false` via `createSearch`) i és
  l'ÚNIC lloc que tradueix un error HTTP a la clau i18n del missatge d'usuari (`toUserErrorKey`). Sense estat.
  Import explícit (`~/services/…`), no auto-import. Regla 03: `/api/giphy` només aquí.
- **Store Pinia** (`app/stores/*.ts`, setup stores, auto-import): estat de l'aplicació. `useGiphyStore` crea el
  handle del servei al setup (una sola vegada) i exposa `items`, `status`, `error`, `errorKey` i l'acció
  `search()`. `useHeroStore` guarda el meme escollit i l'historial. Sense persistència (decisió 004).
- **View** (`pages/*.vue`): compon components i delega a les stores; no conté regles de negoci ni crides HTTP.
  `pages/index.vue` itera `homeSections` (UI-config) per l'ordre; `pages/meme.vue` connecta `useGiphyStore` i
  `useHeroStore`.
- **UI-config** (`app/ui-config/<entitat>/*.ts`): configuració declarativa (seccions de la home: id, component,
  icona, claus de títol/eyebrow). Import explícit. Cap lògica.
- **Domini** (`app/domain/<entitat>/`): tipus (`types.ts`) i funcions pures sense framework (`formatPeriod`).
  Import explícit; es proven en `node`.
- **Dades estàtiques** (`app/data/cv/*.ts`, re-export a `index.ts`): fets no traduïbles (dates ISO, empreses, URLs,
  tags, `profile`). El text va per i18n amb la clau `<secció>.items.<id>.*`.
- **Composables** (`app/composables/`, auto-import): helpers que necessiten el framework però no són estat
  d'aplicació (`useMessageList` per a arrays i18n). Mai un `useFetch` (decisió 029).
- **Preferències**: tema → `useColorMode()` (module, localStorage); idioma → `useI18n()` + cookie (module).
- **Loading**: la pàgina decideix. La graella mostra skeletons durant `status === 'pending'`; la resta de la
  pàgina segueix interactiva. Els errors es mostren amb la clau que dona la store (`errorKey`).
- **Catàleg.** Cada store/servei/composable/funció de domini/export d'ui-config → `.claude/docs/catalog/state.md`
  (bloc `### nom`, `tests/arch/docs-sync.spec.ts`).
