# 08 · One CSS file per component, semantic classes

**What.** Each `Name.vue` component has `app/assets/css/components/<kebab-name>.css`, imported from `main.css`,
with the `.kebab-name` block (the root class appears in the template) and the `.kebab-name--<variant|tone|size|state>`
modifiers and `.kebab-name__<part>` elements. Only these classes in the template (no Tailwind utilities;
allowed list in `docs/standards/styling.md`: none). Colors, spacing and shapes only via `@apply` of semantic
tokens in the component's CSS. **Typography (text size, weight, color) belongs to `CustomText`**
(`custom-text.css`, decision 026): no other component CSS declares it; text elements are `<CustomText>` and
the component's CSS only has layout/spacing.
Pages and the layout use `assets/css/pages.css` under the same criteria.
**Why.** A component's whole appearance is changed in a single file; states (`success`, `danger`…) are
coherent because they come from the same tokens; a global typography change is a single file.
**How it's checked.** `tests/arch/css-per-component.spec.ts` + `vue/no-restricted-class` +
`vue/no-restricted-html-elements`.
