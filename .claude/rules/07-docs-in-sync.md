# 07 · Documentació viva al mateix commit

**Què.** Quan es crea o canvia un component, store, composable, util, token, classe CSS, clau i18n, script, gate o
workflow, s'actualitza el fitxer corresponent de `.claude/docs/catalog/` **en el mateix canvi**, no "després".

- Component → `docs/catalog/components.md` (bloc `### NomComponent` amb TOTES les props, els seus valors possibles i la classe CSS que activa cadascun: és l'estàndard d'ús del component)
- Store/composable/util → `docs/catalog/state.md` (bloc `### nom`)
- Token/classe/estat → `docs/catalog/styles.md`
- Àrea de claus → `docs/catalog/i18n.md`
- Script/gate/hook/workflow → `docs/catalog/ai-workflow.md`
  **Per què.** El catàleg és el context que permet mantenir coherència entre sessions; si menteix és pitjor que no tenir-lo.
  **Abans de desenvolupar** una pàgina o component nou, es llegeix el catàleg i es reutilitza el que hi ha (decisió 027).
  **Com es comprova.** `tests/arch/docs-sync.spec.ts` (cada `.vue`, store, composable i util ha de tenir el seu bloc).
