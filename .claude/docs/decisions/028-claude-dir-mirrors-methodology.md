# 028 · The .claude/ folder mirrors AI-METHODOLOGY.md

**Context.** The methodology document puts governance at the repo root; the user wants all AI context inside `.claude/`.
**Decision.** Same hierarchy as the document, under `.claude/`: `CLAUDE.md` (root) imports `.claude/hard-rules.md` → `.claude/rules/<n>-<slug>.md`; `.claude/docs/standards/` (one file per territory); `.claude/docs/decisions/` (one decision per file); `.claude/docs/catalog/` (living documentation: components, styles, state, i18n, workflow); `.claude/tasks/<slug>/{story,contract,handoff}.md` (deleted on close); `.claude/templates/`, `.claude/workflow.md`, `.claude/backlog.md`, `.claude/hooks/`.
**Consequences.** All architecture and docs tests point to `.claude/docs/...`. Decided on 2026-09-14.
