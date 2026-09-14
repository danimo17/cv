# Contract: Post-launch fixes

**Story:** `story.md` · **Fonts de dades declarades (regla 02):** cap (només infraestructura pròpia i logs de GitHub/Cloudflare).

## Criteris d'acceptació

| #   | Given / When / Then                                                                                                                    | Test que ho cobreix                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Given `danimorales.dev`, When es fa una petició HTTPS, Then respon 200 amb la home                                                     | comprovació manual (`curl -I https://danimorales.dev`)  |
| 2   | Given `www.danimorales.dev`, When es fa una petició HTTPS, Then respon (redirect o mateixa app)                                        | comprovació manual + registre "Add Domain" a Cloudflare |
| 3   | Given el job de Dependabot "npm_and_yarn Update #2", When torna a córrer, Then no falla                                                | log de GitHub Actions / re-run                          |
| 4   | Given els punts D1-D5 del handoff de bootstrap, Then cadascun té una decisió a `.claude/docs/decisions/` o està marcat com a descartat | revisió humana                                          |

## Estàndards a consultar

- `.claude/docs/decisions/024-github-environments-and-branch-protection.md` (permisos del token de Cloudflare)
- `.claude/docs/catalog/ai-workflow.md` (taula de secrets i deploy)

## Preguntes obertes

- Totes al handoff d'aquesta tasca, secció "Pendents".
