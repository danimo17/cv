# 08 · Un CSS per component, classes semàntiques

**Què.** Cada component `Name.vue` té `app/assets/css/components/<kebab-name>.css`, importat des de `main.css`,
amb el bloc `.kebab-name` (la classe arrel apareix al template) i els modificadors
`.kebab-name--<variant|tone|size|state>` i elements `.kebab-name__<part>`. Al template només aquestes classes
(cap utilitat Tailwind; llista permesa a `docs/standards/styling.md`: cap). Colors, espais i formes només via
`@apply` de tokens semàntics al CSS del component. **La tipografia (mida, pes, color de text) és propietat
d'`CustomText`** (`custom-text.css`, decisió 026): cap altre CSS de component la declara; els elements de text són
`<CustomText>` i el CSS del component només posa layout/espai.
Les pàgines i el layout usen `assets/css/pages.css` amb el mateix criteri.
**Per què.** Tot l'aspecte d'un component es canvia en un sol fitxer; els estats (`success`, `danger`…) són
coherents perquè surten dels mateixos tokens; un canvi tipogràfic global és un sol fitxer.
**Com es comprova.** `tests/arch/css-per-component.spec.ts` + `vue/no-restricted-class` +
`vue/no-restricted-html-elements`.
