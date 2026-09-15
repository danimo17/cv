# 034 · Historial de memes: "recent searches" + paginació genèrica

**Decisió (D1 del handoff post-launch).** No es descarta l'historial: es construeix una UI per a ell. A la
part de baix de `/meme` hi ha un apartat "recent searches" amb com a màxim 5 termes cercats, cadascun clicable;
en clicar-ne un s'omple el camp de cerca i s'executa la cerca. A més, Giphy pagina resultats: es crea un
component genèric de paginació (`app/components/shared/CustomPagination.vue` un cop feta la 038) i s'aplica a
la llista de resultats de memes.
**Conseqüències.** `useGiphyStore` guanya un `history` propi de termes cercats (llista de strings, màxim 5, més
recent primer) — **no** és el mateix camp que `history` d'`useHeroStore` (que guarda memes "portats" al hero,
decisió 004; conceptes diferents que comparteixen nom per coincidència). Nou component genèric de paginació,
reutilitzable fora de memes. `GiphyService`/`useGiphyStore` guanyen un `offset` per aprofitar el `total` que ja
retorna `/api/giphy/search`. Catàleg (`state.md`, `components.md`) i i18n (claus noves per a "recent searches"
i paginació) s'actualitzen en el mateix commit (regla 07).
