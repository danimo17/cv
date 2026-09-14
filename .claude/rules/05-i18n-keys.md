# 05 · Tot text d'usuari és una clau i18n

**Què.** Cap string visible hardcoded en templates (`vue/no-bare-strings-in-template`). Tota clau existeix a
`i18n/locales/{en,ca,es}.json` amb la mateixa estructura. Claus: `<area>.<entity>.<field>` (vegeu
`docs/standards/i18n.md`). Dates, URLs i noms propis viuen a `app/data/cv/*.ts`, no als JSON.
**Per què.** Una clau que falta mostra la clau crua a l'usuari: pantalla incorrecta.
**Com es comprova.** ESLint + `tests/unit/i18n-parity.spec.ts`.
