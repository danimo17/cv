# Standard · Components

- **Abans de crear res, consulta el catàleg** (`.claude/docs/catalog/components.md` i `styles.md`, decisió 027):
  reutilitza un component o una prop existent; només crea un primitiu nou si cap encaixa, i llavors documenta'l
  al mateix canvi (regla 07).
- **Ubicació i prefix.** `app/components/shared/App*` (primitius reutilitzables, no saben res del CV ni de les
  stores), `layout/*` (capçalera, banner, peu, toggles), `cv/*` (seccions del CV), `meme/*` (funcionalitat meme).
  PascalCase, multi-paraula. Es registren pel nom de fitxer sense prefix de carpeta (`pathPrefix: false`).
- **Primitius obligatoris (decisió 026).** Els elements natius de text, formulari, enllaç i imatge estan prohibits
  fora del seu primitiu (`vue/no-restricted-html-elements` a `app/**`):
  - `p, span, h1-h6, small, strong, em, label, figcaption, time, li` amb text → `<AppText as="…" variant="…">`
  - `input, select, textarea` → `<AppInput type="…">` · `button` → `<AppButton>` · `a`/`NuxtLink*` → `<AppLink>` · `img` → `<AppImage>`
  - Estructurals natius: `div`, `section`, `article`, `header`, `footer`, `nav`, `ul`, `ol`, `li` (sense text propi),
    `figure`, `form`, `fieldset`, `legend`.
  - Els wrappers (`shared/App{Text,Input,Button,Link,Image,Icon}.vue`) són els únics amb l'excepció ESLint.
- **SFC.** `<script setup lang="ts">` → `<template>` → sense `<style>` (el CSS viu a `assets/css/components/`, regla 08).
- **Props.** `defineProps<{...}>()` tipat + `withDefaults`. Props de variació estàndard, sempre amb aquests noms:
  - `tone?: Tone` (`primary | secondary | neutral | success | info | warning | danger`) → color semàntic
  - `size?: Size` (`sm | md | lg`)
  - `variant?` → forma (`solid | outline | ghost`, `outline | filled | elevated`, `detailed | compact`…)
  - estats booleans: `loading`, `disabled`, `selected`, `block`
    Els tipus compartits són a `app/types/ui.ts`. Mai `any`. Cada valor d'una prop activa exactament una classe
    `.bloc--<valor>` documentada al catàleg.
- **Classes.** `:class="['kebab-name', `kebab-name--${size}`, `kebab-name--${tone}`, { 'kebab-name--loading': loading }]"`.
  Parts internes: `kebab-name__part`. Cap utilitat Tailwind al template. Tota secció té la classe arrel del seu
  bloc (`class="about-section"` sobre `AppSection`).
- **Tipografia.** Només `AppText` posa mida, pes i color de text. Els CSS de secció només tenen layout i espai.
- **Slots.** Slot per defecte amb contingut de fallback quan té sentit; slots amb nom (`header`, `footer`); slots
  amb props quan el consumidor ha de saber alguna cosa (`AppMarquee` → `{ duplicate }`).
- **Events.** `defineEmits<{ select: [meme: Meme] }>()` tipats; noms en present (`select`, `search`, `use`).
- **Text.** Mai bare strings (regla 05). Els primitius `shared/` reben el text per props/slots; les seccions `cv/`
  i `meme/` criden `useI18n()`. Les seccions de la home llegeixen `id`/`icon`/`titleKey`/`eyebrowKey` de
  `ui-config/cv/sections.ts` amb `getSectionConfig(id)`.
- **Estat.** `shared/` no toca stores ni serveis. `cv/` i `meme/` poden llegir stores; les accions les dispara la
  pàgina o el component de secció, mai un primitiu. Cap component crida un servei directament (decisió 029).
- **Accessibilitat.** Botons només-icona → `aria-label`; imatges → `alt` traduït; toggles → `aria-pressed`;
  llistes de resultats → `<ul>/<li>`; alertes → `role="status"|"alert"`; contingut duplicat decoratiu →
  `aria-hidden` + `inert`; `data-testid` només per a e2e.
- **Reutilització.** Un component "reutilitzable" té almenys dos consumidors diferents (p. ex. `ExperienceItem`
  a experiència, formació i certificacions). Un sol caller no és prova de res.
- **Quan crear-ne un.** Quan el mateix markup+estat apareix dues vegades, o quan una secció supera ~80 línies.
- **Catàleg.** Cada component nou/canviat → bloc a `.claude/docs/catalog/components.md` amb la taula de props
  (nom, tipus, default, valors → classe CSS) (regla 07). Classes noves → `catalog/styles.md`.
