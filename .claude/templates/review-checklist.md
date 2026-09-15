# Review checklist (abans del primer commit)

- [ ] **Secrets (01):** cap clau al diff, `.env` no traçat, `api_key` només a `server/`.
- [ ] **Empresa (02):** cap codi/recurs intern; fonts declarades al contracte.
- [ ] **Frontera Giphy (03):** `api.giphy.com` només a `server/`; `/api/giphy` només a `app/services/giphy/`; les vistes només via `useGiphyStore`.
- [ ] **PII (04):** cap telèfon/adreça a dades, i18n ni PDFs (text extret).
- [ ] **i18n (05):** cap string bare; claus als 3 locales.
- [ ] **Branca (06):** estic a `feat/<slug>`.
- [ ] **Catàleg (07):** cada component/store/composable/token/workflow nou o canviat té el seu bloc actualitzat.
- [ ] **CSS (08):** cada component té el seu CSS importat a `main.css`; cap utilitat de color/espai al template.
- [ ] **Gates (09):** `pnpm gate` en verd amb sortida copiada al handoff.
- [ ] **Contracte (10):** cada criteri té un test amb nom; res al diff que cap criteri demani.
- [ ] **Decisions (11):** tota decisió d'aquesta tasca està a `.claude/docs/decisions/`.
- [ ] **Primitius (026, 038):** cap `p/span/h*/a/img/input/select/textarea/button` natiu fora dels wrappers `Custom*`; tot estil via props documentades al catàleg.
- [ ] **Docs viva (027):** abans de crear res s'ha consultat el catàleg; cada prop/valor nou està documentat amb la seva classe.
- [ ] **Subagents (12):** el handoff diu qui ha fet què.
- [ ] **Accessibilitat:** focus visible, `aria-*` als botons icona, contrast dels tokens en dark.
