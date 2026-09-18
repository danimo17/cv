# Review checklist (before the first commit)

- [ ] **Secrets (01):** no key in the diff, `.env` not tracked, `api_key` only in `server/`.
- [ ] **Company (02):** no internal code/resources; sources declared in the contract.
- [ ] **Giphy boundary (03):** `api.giphy.com` only in `server/`; `/api/giphy` only in `app/services/giphy/`; views only via `useGiphyStore`.
- [ ] **PII (04):** no phone/address in data, i18n, or PDFs (extracted text).
- [ ] **i18n (05):** no bare strings; keys present in all 3 locales.
- [ ] **Branch (06):** I am on `feat/<slug>`.
- [ ] **Catalog (07):** every new or changed component/store/composable/token/workflow has its block updated.
- [ ] **CSS (08):** every component has its CSS imported in `main.css`; no color/spacing utility in the template.
- [ ] **Gates (09):** `pnpm gate` green with output copied into the handoff.
- [ ] **Contract (10):** every criterion has a named test; nothing in the diff that no criterion calls for.
- [ ] **Decisions (11):** every decision from this task is in `.claude/docs/decisions/`.
- [ ] **Primitives (026, 038):** no native `p/span/h*/a/img/input/select/textarea/button` outside the `Custom*` wrappers; all styling via props documented in the catalog.
- [ ] **Living docs (027):** the catalog was consulted before creating anything; every new prop/value is documented with its class.
- [ ] **Subagents (12):** the handoff states who did what.
- [ ] **Accessibility:** visible focus, `aria-*` on icon buttons, token contrast in dark mode.
