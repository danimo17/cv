# Contract: Post-launch fixes

**Story:** `story.md` · **Fonts de dades declarades (regla 02):** cap (només infraestructura pròpia i logs de GitHub/Cloudflare).

## Criteris d'acceptació

| #   | Given / When / Then                                                                                                                                                           | Test que ho cobreix                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Given `danimorales.dev`, When es fa una petició HTTPS, Then respon 200 amb la home                                                                                            | ✅ fet — `curl -I https://danimorales.dev` → 200                                                                                                             |
| 2   | Given `www.danimorales.dev`, When es fa una petició HTTPS, Then respon (redirect o mateixa app)                                                                               | ⏳ pendent tu — Cloudflare dashboard → Worker `cv` → Domains → Add Domain (o Redirect Rule)                                                                  |
| 3   | Given el job de Dependabot "npm_and_yarn Update #2", When torna a córrer, Then no falla                                                                                       | ⏳ pendent — causa arrel trobada (pnpm 12.4.1), esperant el reintent automàtic de dilluns o acció manual teva                                                |
| 4   | Given els punts D1-D5 del handoff de bootstrap, Then cadascun té una decisió a `.claude/docs/decisions/` o està marcat com a descartat                                        | revisió humana (fet: decisions 034-038)                                                                                                                      |
| 5   | Given el prefix `App*` (decisió 038), When es renomena tota la família a `Custom*`, Then cap referència vella queda al codi, docs, ESLint ni tests, i la gate segueix en verd | ✅ fet — `pnpm gate`, `tests/arch/css-per-component.spec.ts`, grep de `App[A-Z]` net                                                                         |
| 6   | Given `/meme`, When s'ha cercat almenys un terme, Then hi ha un apartat "recent searches" amb com a màxim 5 termes, clicables, que omplen el camp i executen la cerca         | ✅ fet — `tests/unit/stores/giphy.spec.ts`, `MemeRecentSearches.spec.ts`; verificat en viu (`pnpm dev`, cat→dog→clic "dog" reomple el camp i torna a cercar) |
| 7   | Given resultats de Giphy paginables, When n'hi ha més d'una pàgina, Then un component genèric `CustomPagination` permet navegar-hi des de `/meme`                             | ✅ fet — `CustomPagination.spec.ts`; verificat en viu (Next page → "Page 2 of 42" amb resultats nous)                                                        |
| 8   | Given `CustomImage` (decisió 037), When es passen les props opcionals `srcset`/`sizes`, Then es reflecteixen a l'`<img>`; si no es passen, comportament idèntic a l'actual    | ✅ fet — `tests/unit/components/CustomImage.spec.ts`                                                                                                         |

## Estàndards a consultar

- `.claude/docs/decisions/024-github-environments-and-branch-protection.md` (permisos del token de Cloudflare)
- `.claude/docs/catalog/ai-workflow.md` (taula de secrets i deploy)
- `.claude/docs/decisions/026-custom-primitives.md` + `038-rename-app-to-custom-prefix.md` (rename)
- `.claude/docs/decisions/034-meme-recent-searches-and-pagination.md`, `037-customimage-srcset-ready.md`
- `.claude/docs/standards/{components,state,i18n,testing}.md`

## Preguntes obertes

- Cap. D1-D5 decidides (034-038). Dependabot: causa arrel trobada (pnpm 12.4.1 no pot autodescarregar el
  binari natiu dins el sandbox de Dependabot); pendent triar retry vs downgrade de `packageManager` amb
  l'usuari abans de tocar-ho.
