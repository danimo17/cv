# 031 · Escriptura al repo: només l'usuari

**Context.** El repo és públic (030) però només l'usuari hi pot escriure.
**Decisió.** Cap col·laborador a GitHub. Només l'usuari fa `push` i `merge`. La IA pot fer commits locals a branques `feat/<slug>` (regla 06) però mai push. Les PRs externes (forks) són possibles però només l'usuari les pot fusionar; els workflows en PRs de forks no reben secrets (GitHub no els exposa), així que preview i deploy no s'executen per a tercers. El ruleset de `main` (024) exigeix PR + checks i bloqueja força-push i esborrat.
**Conseqüències.** Handoff sempre acaba amb: branca a punt, gate en verd, i és l'usuari qui fa `git push` i obre la PR. Regla 06 actualitzada.
