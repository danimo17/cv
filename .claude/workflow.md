# Workflow de treball amb IA (vinculant)

```
story → contract → build ⟲ iterate → consolidate (gate) → validate → handoff → commit → review → gate:push → PR (IA) → CI+seguretat → merge → deploy
```

1. **Story** — `.claude/tasks/<slug>/story.md` (plantilla `templates/story.md`): "Com a <actor> vull <què> per
   <valor>", fora d'abast, dependències externes. S'afegeix a `.claude/backlog.md` amb estat `doing` i
   `.claude/tasks/ACTIVE` passa a contenir el slug. Branca `feat/<slug>`.
2. **Contract** — `contract.md` (plantilla `templates/contract.md`): criteris Given/When/Then, cadascun amb el
   test que el cobrirà (fitxer + nom), fonts de dades declarades (regla 02), estàndards a consultar, preguntes
   obertes amb destinació (`decided:` / `owner:` / `docs/decisions/NNN`). El hook `require-contract` bloqueja els
   commits si no existeix. El contracte l'escriu el fil principal (regla 12).
3. **Build / iterate** — el fil principal reparteix el contracte en encàrrecs per a subagents (regla 12), per
   capes (config → server → estat → components → pàgines), cada artefacte amb el seu CSS (regla 08), el seu bloc
   al catàleg (regla 07) i el seu test si té lògica. Durant les correccions de l'humà no es corre la gate
   sencera: una línia de report per canvi, contracte actualitzat si es mou l'abast. Cada correcció demanada per
   l'humà guanya un test en el mateix canvi.
4. **Consolidate** — `pnpm gate`. Es corregeix el que falla. Si un test és incorrecte, es justifica al contracte.
5. **Validate** — sortida **real** de `pnpm gate` a `handoff.md` (N tests, 0 lint, 0 type errors) i què NO
   cobreix la suite.
6. **Handoff** — `handoff.md` = estat veritable de la branca + **Pendents de l'usuari** + quins subagents han fet
   què. S'actualitza quan alguna cosa deixa de ser certa, no només al final.
7. **Commit** — commits a `feat/<slug>` (pre-commit = gate).
8. **Review** (decisió 039) — just abans d'obrir la PR, no abans del primer commit: `templates/review-checklist.md`
   (compliance) + `/code-review` (bugs/qualitat) sobre tot el diff de la branca. Una troballa és un claim: s'obre
   el fitxer i es confirma abans d'actuar. Si hi ha correccions, es tornen a committar.
9. **`gate:push`** — build + e2e sencer en verd abans de push (regla 09).
10. **Push / PR (IA)** — amb permís explícit de l'usuari per aquell push concret (decisió 031), la IA fa
    `git push` de la branca `feat/*` i obre la PR amb `gh pr create` (decisió 039: títol en anglès sense
    prefix, cos amb seccions fixes Summary/Acceptance criteria/Review/User pendings/Test plan). La CI repeteix
    la gate, fa build + e2e i els escanejos de seguretat; la PR obté una URL de preview.
11. **Merge / deploy** — l'humà revisa i fa merge (regla 06); GitHub només ho permet amb tots els checks en
    verd. El merge a `main` desplega a producció automàticament (workflow `deploy.yml`).
12. **Close** — promoure el que és durable (`docs/standards/`, `docs/decisions/`, `docs/catalog/`), esborrar
    `.claude/tasks/<slug>/`, buidar `ACTIVE`, marcar `done` al backlog.

## Gates (què bloqueja què)

| Gate                              | Executa                                  | Bloqueja                 |
| --------------------------------- | ---------------------------------------- | ------------------------ |
| `pre-commit` (git hook)           | `pnpm gate`                              | el commit                |
| `pre-push` (git hook)             | `pnpm gate:push`                         | el push                  |
| `require-contract` (Claude hook)  | comprova contracte actiu i `--no-verify` | els commits des de la IA |
| `git-safety` (Claude hook global) | commit/push a `main`                     | l'ordre                  |
| CI `ci.yml`                       | gate + build + e2e                       | el merge de la PR        |
| `security.yml`                    | gitleaks, pnpm audit, CodeQL             | el merge de la PR        |
| Ruleset de `main` (GitHub)        | exigeix els checks anteriors + PR        | el merge directe         |
| `deploy.yml`                      | només en push a `main` amb CI verda      | el deploy                |

Desbloquejar legítimament = fer que passi. Mai `--no-verify`, mai `skip`, mai esborrar el test.
