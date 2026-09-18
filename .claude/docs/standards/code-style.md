# Standard · Code style (fully automated)

Prettier (`.prettierrc`): no `;`, single quotes, 100 columns, es5 trailing commas. ESLint (`eslint.config.mjs`).

| Rule                                    | Good                                       | Bad                                                                                 |
| --------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `vue/block-order` script → template     | `<script setup>` at the top                | `<template>` at the top                                                             |
| `vue/define-macros-order`               | `defineProps` before `defineEmits`         | the other way around                                                                |
| `vue/component-name-in-template-casing` | `<CustomButton>`                           | `<custom-button>`                                                                   |
| `vue/require-explicit-emits`            | `defineEmits<{ select: [Meme] }>()`        | `$emit('foo')` without declaring it                                                 |
| `vue/no-bare-strings-in-template`       | `{{ t('hero.cta.contact') }}`              | `Contact me`                                                                        |
| `vue/no-restricted-class`               | `class="custom-card custom-card--outline"` | `class="p-4 bg-white"`                                                              |
| `@typescript-eslint/no-explicit-any`    | a concrete type or `unknown` + narrow      | `any`                                                                               |
| `no-console`                            | throw `createError` / return state         | `console.log` (`error`/`warn` allowed in `server/`)                                 |
| `no-restricted-imports`                 | `<CustomIcon name="sun" />`                | `import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'` outside CustomIcon |
| `sort-imports` (members)                | `import { a, b }`                          | `import { b, a }`                                                                   |

Other conventions (checked in review, not by a tool): `kebab-case.ts` files, `PascalCase.vue` components,
`useX.ts` composables, `useXStore` stores. No comments in code (rule 14) — a deliberate simplification that
would once have been a `// ponytail: …` comment now goes in `.claude/docs/decisions/` instead. No
`eslint-disable`/`@ts-expect-error`/`@ts-ignore` anywhere (rule 15).
