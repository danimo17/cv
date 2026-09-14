# 028 · La carpeta .claude/ és el mirall d'AI-METHODOLOGY.md

**Context.** El document de metodologia posa la governança a l'arrel del repo; l'usuari vol tot el context d'IA dins de `.claude/`.
**Decisió.** Mateixa jerarquia que el document, sota `.claude/`: `CLAUDE.md` (arrel) importa `.claude/hard-rules.md` → `.claude/rules/<n>-<slug>.md`; `.claude/docs/standards/` (un fitxer per territori); `.claude/docs/decisions/` (una decisió per fitxer); `.claude/docs/catalog/` (documentació viva: components, estils, estat, i18n, workflow); `.claude/tasks/<slug>/{story,contract,handoff}.md` (esborrats en tancar); `.claude/templates/`, `.claude/workflow.md`, `.claude/backlog.md`, `.claude/hooks/`.
**Conseqüències.** Tots els tests d'arquitectura i docs apunten a `.claude/docs/...`. Decidit el 2026-09-14.
