# 06 · La IA treballa en branca

**Què.** Tota feina de la IA va a `feat/<slug>` (slug = tasca activa). Mai commits, merges, rebases, resets ni
pushes amb `main` com a branca actual o destí. Per defecte, la IA deixa la branca a punt i és l'usuari qui fa
push, PR i merge. **Excepció (decisió 031, 2026-09-14):** si l'usuari ho demana explícitament en aquell
moment, la IA pot fer `git push` d'una branca `feat/*` (mai de `main`) — el permís és per aquell push concret,
no un blanc-i-negre permanent; cal tornar-lo a donar cada vegada. El merge a `main` continua sent sempre
exclusiu de l'usuari, i GitHub només el permet amb la CI i els escanejos de seguretat en verd (branch
protection).
**Per què.** `main` és el que es desplega a producció; la revisió humana és l'última gate. El merge és
irreversible de cara al desplegament, per això mai es delega; el push d'una branca de treball és reversible
(es pot esborrar) i per això es pot delegar puntualment amb permís exprés.
**Com es comprova.** Hook global `git-safety` del Claude Code de l'usuari (bloqueja force-push i push directe
a `main`/`master`, però no push d'una branca `feat/*`) + ruleset de `main` a GitHub.
