# 10 · Contracte abans de codi

**Què.** Cap canvi de codi sense `.claude/tasks/ACTIVE` apuntant a `.claude/tasks/<slug>/` amb `story.md` i
`contract.md` (criteris Given/When/Then, cadascun amb el test que el cobrirà). Si l'abast es mou, el contracte
s'actualitza en el moment.
**Per què.** Sense contracte no hi ha definició de "fet" i la validació és una opinió.
**Com es comprova.** `.claude/hooks/require-contract.sh` bloqueja els commits si no hi ha contracte amb criteris.
