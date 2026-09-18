# Standard · Components

- **Before creating anything, check the catalog** (`.claude/docs/catalog/components.md` and `styles.md`, decision 027):
  reuse an existing component or prop; only create a new primitive if none fits, and then document it in the
  same change (rule 07).
- **Location and prefix.** `app/components/shared/Custom*` (reusable primitives, unaware of the CV or the
  stores), `layout/*` (header, banner, footer, toggles), `cv/*` (CV sections), `meme/*` (meme functionality).
  PascalCase, multi-word. Registered by filename without a folder prefix (`pathPrefix: false`).
- **Mandatory primitives (decision 026).** Native text, form, link and image elements are forbidden
  outside their primitive (`vue/no-restricted-html-elements` in `app/**`):
  - `p, span, h1-h6, small, strong, em, label, figcaption, time, li` with text → `<CustomText as="…" variant="…">`
  - `input, select, textarea` → `<CustomInput type="…">` · `button` → `<CustomButton>` · `a`/`NuxtLink*` → `<CustomLink>` · `img` → `<CustomImage>`
  - Native structural elements: `div`, `section`, `article`, `header`, `footer`, `nav`, `ul`, `ol`, `li` (with no
    text of their own), `figure`, `form`, `fieldset`, `legend`.
  - The wrappers (`shared/Custom{Text,Input,Button,Link,Image,Icon}.vue`) are the only ones with the ESLint exception.
- **SFC.** `<script setup lang="ts">` → `<template>` → no `<style>` (CSS lives in `assets/css/components/`, rule 08).
- **Props.** Typed `defineProps<{...}>()` + `withDefaults`. Standard variation props, always with these names:
  - `tone?: Tone` (`primary | secondary | neutral | success | info | warning | danger`) → semantic color
  - `size?: Size` (`sm | md | lg`)
  - `variant?` → shape (`solid | outline | ghost`, `outline | filled | elevated`, `detailed | compact`…)
  - boolean states: `loading`, `disabled`, `selected`, `block`
    Shared types live in `app/types/ui.ts`. Never `any`. Each prop value activates exactly one
    `.block--<value>` class documented in the catalog.
- **Classes.** `:class="['kebab-name', `kebab-name--${size}`, `kebab-name--${tone}`, { 'kebab-name--loading': loading }]"`.
  Internal parts: `kebab-name__part`. No Tailwind utilities in the template. Every section carries the root class
  of its block (`class="about-section"` on `CustomSection`).
- **Typography.** Only `CustomText` sets text size, weight and color. Section CSS only handles layout and spacing.
- **Slots.** Default slot with fallback content when it makes sense; named slots (`header`, `footer`); slots
  with props when the consumer needs to know something (`CustomMarquee` → `{ duplicate }`).
- **Events.** Typed `defineEmits<{ select: [meme: Meme] }>()`; present-tense names (`select`, `search`, `use`).
- **Text.** Never bare strings (rule 05). `shared/` primitives receive text via props/slots; `cv/` and `meme/`
  sections call `useI18n()`. Home sections read `id`/`icon`/`titleKey`/`eyebrowKey` from
  `ui-config/cv/sections.ts` via `getSectionConfig(id)`.
- **State.** `shared/` never touches stores or services. `cv/` and `meme/` may read stores; actions are
  triggered by the page or the section component, never by a primitive. No component calls a service
  directly (decision 029).
- **Accessibility.** Icon-only buttons → `aria-label`; images → translated `alt`; toggles → `aria-pressed`;
  result lists → `<ul>/<li>`; alerts → `role="status"|"alert"`; decorative duplicated content →
  `aria-hidden` + `inert`; `data-testid` only for e2e.
- **Reuse.** A "reusable" component has at least two distinct consumers (e.g. `ExperienceItem`
  in experience, education and certifications). A single caller is not proof of anything.
- **When to create one.** When the same markup+state appears twice, or when a section exceeds ~80 lines.
- **Catalog.** Every new/changed component → a block in `.claude/docs/catalog/components.md` with the props
  table (name, type, default, values → CSS class) (rule 07). New classes → `catalog/styles.md`.
