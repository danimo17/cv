# Standard · Tests

| Capa           | Eina                           | Cobreix                                                                                                            | On                               |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Unit           | Vitest (env `nuxt`, happy-dom) | utils purs, `server/utils`, stores, composables (amb `registerEndpoint`), components amb lògica (`mountSuspended`) | `tests/unit/**`                  |
| Arquitectura   | Vitest (env `node`)            | invariants que cap linter expressa: fronteres, secrets, docs-sync, css-per-component, PII                          | `tests/arch/**`                  |
| E2E            | Playwright (chromium)          | el flux crític meme → home, tema, idioma, validació del server route. `/api/giphy/**` mockejat amb `page.route`    | `e2e/**`                         |
| Seguretat (CI) | gitleaks, pnpm audit, CodeQL   | secrets al repo, deps vulnerables, patrons insegurs                                                                | `.github/workflows/security.yml` |

- Un criteri del contracte = un test amb nom. Una correcció demanada per l'humà = un test que falla si es desfà.
- Els tests no coneixen Giphy real (mai la clau). Server utils es proven en pur; el handler via e2e (400 sense clau).
- Es reporta la sortida real (`N passed`), i el que **no** cobreix la suite.
- `// @vitest-environment node` als tests que no necessiten Nuxt (arquitectura, utils purs): més ràpids.
