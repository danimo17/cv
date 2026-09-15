# Standard · Estil de codi (tot mecanitzat)

Prettier (`.prettierrc`): sense `;`, cometes simples, 100 columnes, coma final es5. ESLint (`eslint.config.mjs`).

| Regla                                   | Bo                                         | Dolent                                                                              |
| --------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `vue/block-order` script → template     | `<script setup>` a dalt                    | `<template>` a dalt                                                                 |
| `vue/define-macros-order`               | `defineProps` abans de `defineEmits`       | al revés                                                                            |
| `vue/component-name-in-template-casing` | `<CustomButton>`                           | `<custom-button>`                                                                   |
| `vue/require-explicit-emits`            | `defineEmits<{ select: [Meme] }>()`        | `$emit('foo')` sense declarar                                                       |
| `vue/no-bare-strings-in-template`       | `{{ t('hero.cta.contact') }}`              | `Contact me`                                                                        |
| `vue/no-restricted-class`               | `class="custom-card custom-card--outline"` | `class="p-4 bg-white"`                                                              |
| `@typescript-eslint/no-explicit-any`    | tipus concret o `unknown` + narrow         | `any`                                                                               |
| `no-console`                            | llençar `createError` / retornar estat     | `console.log` (a `server/` es permet `error`/`warn`)                                |
| `no-restricted-imports`                 | `<CustomIcon name="sun" />`                | `import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'` fora de CustomIcon |
| `sort-imports` (membres)                | `import { a, b }`                          | `import { b, a }`                                                                   |

Altres convencions (les revisa la review, no una eina): fitxers `kebab-case.ts`, components `PascalCase.vue`,
composables `useX.ts`, stores `useXStore`, comentaris `// ponytail: …` per a simplificacions deliberades amb el
sostre i el camí d'upgrade.
