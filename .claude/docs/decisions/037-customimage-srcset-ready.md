# 037 · CustomImage preparat per a srcset, sense generar mides encara

**Decisió (D4 del handoff post-launch).** `CustomImage` (nom post-038) accepta props opcionals `srcset` i
`sizes` que, si es passen, es reflecteixen tal qual a l'`<img>`. Sense aquestes props, es comporta com ara
(un sol `src`). No es generen mides addicionals de la foto ara: es fa YAGNI fins que Lighthouse ho demani.
**Conseqüències.** Canvi petit i additiu al primitiu; cap ús real de `srcset`/`sizes` de moment. Catàleg de
components (`docs/catalog/components.md`) documenta les noves props.
