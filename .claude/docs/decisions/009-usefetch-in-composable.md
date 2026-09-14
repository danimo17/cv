# 009 · useFetch al composable (SUBSTITUÏDA per 029)

**Context.** Cal ensenyar `useFetch` i Pinia. El doc d'arquitectura diu 'tota crida via store', però `useFetch` és un composable de setup, no d'accions de store.
**Decisió.** `app/composables/useGiphySearch.ts` fa el `useFetch` a `/api/giphy/search`. La store `hero` només guarda el meme escollit i l'historial. La pàgina (view) connecta els dos.
**Conseqüències.** Frontera documentada a `docs/standards/state.md`; test d'arquitectura 03.

**Estat.** Substituïda el 2026-09-14 per la decisió 029 (capes Service → Store → View).
