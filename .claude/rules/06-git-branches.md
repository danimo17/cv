# 06 · La IA treballa en branca

**Què.** Tota feina de la IA va a `feat/<slug>` (slug = tasca activa). Mai commits, merges, rebases, resets ni
pushes amb `main` com a branca actual o destí. La IA mai fa `push` (decisió 031): deixa la branca a punt i l'usuari fa push, PR i merge, i GitHub només el permet
amb la CI i els escanejos de seguretat en verd (branch protection).
**Per què.** `main` és el que es desplega a producció; la revisió humana és l'última gate.
**Com es comprova.** Hook global `git-safety` del Claude Code de l'usuari + ruleset de `main` a GitHub.
