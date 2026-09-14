# 029 · Capes de l'app segons ARCHITECTURE-TEMPLATE.md (substitueix la 009)

**Context.** El document demana API → Service → Store → View → UI-config amb dependència unidireccional i 'tota crida a l'API passa per una acció de store'. La 009 havia posat `useFetch` en un composable.
**Decisió.**

- `server/api/giphy/*` (API) ← `app/services/giphy/GiphyService.ts` (una classe per API: defineix la petició amb `useFetch`/`$fetch`, normalitza errors i és l'ÚNIC lloc que produeix el missatge d'error d'usuari) ← `app/stores/giphy.ts` (estat de cerca: `query`, `items`, `status`, `error`; acció `search()` que crida el servei) i `app/stores/hero.ts` (selecció) ← `app/pages/*.vue` (views primes: composen components i deleguen a les stores) ← `app/ui-config/<entitat>/` (configuració declarativa: seccions de la home, grups del stack).
- `app/domain/cv/` (tipus i regles de negoci del CV, sense framework: `formatPeriod`), `app/data/cv/` (taules hardcoded: experiència, formació, certificacions, stack, perfil), `app/components/shared/` (primitius `App*`, abans `ui/`), `app/components/{layout,cv,meme}/`.
- El composable `useGiphySearch` desapareix; la regla 03 passa a: `/api/giphy` només a `app/services/giphy/`.
  **Conseqüències.** `useFetch` viu al servei (definició de la petició, `immediate: false`); la store en manté l'estat i exposa l'acció. Tests d'arquitectura i catàleg actualitzats. La 009 queda substituïda.
