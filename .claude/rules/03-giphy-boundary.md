# 03 · Frontera Giphy

**Què.** `api.giphy.com` només apareix a `server/`. El client parla amb `/api/giphy/*` només des de la capa de
servei `app/services/giphy/GiphyService.ts` (decisió 029); la store `useGiphyStore` n'és l'única consumidora i les
vistes només llegeixen la store. Cap component, pàgina ni composable fa `useFetch`/`$fetch` a Giphy ni a
`/api/giphy` directament.
**Per què.** La clau viu al servidor (regla 01); una sola porta d'entrada permet canviar proveïdor, cachejar,
validar i traduir errors en un lloc.
**Com es comprova.** `tests/arch/giphy-boundary.spec.ts` (`/api/giphy` només a `app/services/giphy/` i `server/`).
