# 029 · App layers per ARCHITECTURE-TEMPLATE.md (replaces 009)

**Context.** The document calls for API → Service → Store → View → UI-config with unidirectional dependency and 'every API call goes through a store action'. 009 had put `useFetch` in a composable.
**Decision.**

- `server/api/giphy/*` (API) ← `app/services/giphy/GiphyService.ts` (one class per API: defines the request with `useFetch`/`$fetch`, normalizes errors, and is the ONLY place that produces the user-facing error message) ← `app/stores/giphy.ts` (search state: `query`, `items`, `status`, `error`; `search()` action that calls the service) and `app/stores/hero.ts` (selection) ← `app/pages/*.vue` (thin views: compose components and delegate to the stores) ← `app/ui-config/<entity>/` (declarative configuration: home sections, stack groups).
- `app/domain/cv/` (CV types and business rules, framework-free: `formatPeriod`), `app/data/cv/` (hardcoded tables: experience, education, certifications, stack, profile), `app/components/shared/` (`App*` primitives, formerly `ui/`), `app/components/{layout,cv,meme}/`.
- The `useGiphySearch` composable goes away; rule 03 becomes: `/api/giphy` only in `app/services/giphy/`.
  **Consequences.** `useFetch` lives in the service (request definition, `immediate: false`); the store holds its state and exposes the action. Architecture tests and catalog updated. 009 is superseded.
