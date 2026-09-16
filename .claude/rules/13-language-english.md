# 13 · Tot en anglès

**Què.** Tot artefacte del repo es escriu en anglès: codi, comentaris, noms de fitxer, la documentació de
`.claude/` (hard-rules, workflow, regles, decisions, estàndards, catàleg, contractes, story, handoff),
`CLAUDE.md`, missatges de commit i títol/cos de les PRs (decisió 039). **Única excepció:** el contingut
natural de `i18n/locales/{ca,es,en}.json` — les traduccions reals del CV en els 3 idiomes — que és
precisament la raó de ser d'aquells fitxers.
**Per què.** El repo és públic (decisió 030); l'anglès és l'estàndard de facto per a codi obert i és
consistent amb els commits, que ja ho eren.
**Com es comprova.** Revisió humana; migració existent inventariada i pendent a `docs/decisions/040-english-only.md`
(deute explícit, no retroactiva de cop). A valorar un test `tests/arch/language.spec.ts` que bloquegi
caràcters catalans fora de `i18n/locales/` un cop feta la migració.
