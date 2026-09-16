# 039 · Convencions de Pull Request

**Context.** Fins ara només hi ha hagut 1 PR (#1, "Feat/bootstrap") amb títol per defecte de GitHub (nom de
branca capitalitzat) i cos buit — soroll, no una convenció deliberada. L'usuari ha demanat (2026-09-16) una
estructura fixa per a totes les PRs a partir d'ara, que sigui la IA qui les obri, i que la revisió (checklist +
`/code-review`) es faci just abans d'obrir-les, no abans del primer commit com deia `workflow.md` fins ara.
Decidit via `/grill-me`.

**Decisió.**

1. **Títol:** resum curt en llenguatge natural, en anglès, sense prefix de tipus ni de slug (el slug ja hi és a
   la branca `feat/<slug>` i al peu de la PR). Ex: `Add www domain, fix Dependabot, enable Web Analytics`.
2. **Cos:** seccions fixes, sempre en aquest ordre i en anglès:
   - `## Summary` — 2-4 bullets de què canvia i per què.
   - `## Acceptance criteria` — llista dels criteris del contracte (`.claude/tasks/<slug>/contract.md`), amb
     ✅/⏳.
   - `## Review` — què s'ha comprovat (checklist de compliance + `/code-review`) i el resultat.
   - `## User pendings` — només si en queden (accions manuals fora de l'abast de la IA).
   - `## Test plan` — sortida real de `pnpm gate:push` (N tests, build, e2e).
3. **Idioma:** anglès (consistent amb els commits, que ja ho són; el repo és públic). **Superat el mateix dia
   per la regla 13**: tot el repo (inclosa la resta de `.claude/`) passa a ser en anglès, no només les PRs —
   vegeu `docs/decisions/040-english-only.md` i el pendent de migració al handoff.
4. **Qui l'obre:** la IA, amb `gh pr create`, analitzant el diff real (no copiant el handoff tal qual).
   L'usuari continua sent l'únic que fa merge (decisió 031, sense canvis).
5. **Quan:** el pas "Review" del workflow (checklist + `/code-review`) es mou a just abans d'obrir la PR (no
   abans del primer commit); si la revisió troba res, es corregeix i es torna a córrer `pnpm gate:push` abans
   de push/PR. `workflow.md` actualitzat en el mateix canvi (regla 07).

**Conseqüències.** Cap test automàtic ho comprova (és procés de la IA, no codi); es revisa handoff a handoff.
Si calgués citar exemples, la PR d'aquesta mateixa tasca (`post-launch`) és la primera que segueix aquesta
convenció.
