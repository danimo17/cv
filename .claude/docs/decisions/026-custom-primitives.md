# 026 · Everything goes through our own components (primitives)

**Context.** The user wants everything a library like PrimeVue would offer (inputs, text, buttons, links, images, cards, badges, alerts, skeletons) to go through a single component of our own per type, so style or template can be changed in one place.
**Decision.** Primitives in `app/components/shared/` (prefix `App`; the user's 'CustomInput'/'CustomText' are `AppInput`/`AppText`):

- `AppText`: every text `p`, `span`, `h1`..`h6`, `small`, `strong`, `em`, `label`. Props: `as`, `variant` (typographic scale), `tone`, `weight`, `align`, `truncate`.
- `AppInput`: every input. Props: `type` (`text|search|email|number|textarea|select|multiselect|radio|checkbox`), `options`, `label`, `hint`, `tone`, `size`, `icon`; typed `v-model`.
- `AppLink`: every text `a` and `NuxtLinkLocale`. `AppImage`: every `img`. Already existing: `AppButton`, `AppIcon`, `AppBadge`, `AppAlert`, `AppCard`, `AppSection`, `AppSkeleton`.
- The corresponding native elements are forbidden outside their wrappers (`vue/no-restricted-html-elements`). Structural elements (`div`, `section`, `ul`, `li`, `nav`, `header`, `footer`, `figure`, `form`, `time`) remain native.
  **Consequences.** Each primitive has its own CSS (rule 08) and a catalog block with ALL styles applicable via props (rule 07). A global style change = touch tokens + primitives' CSS.

**Note (2026-09-14).** With decision 029 the folder moves to `app/components/shared/`. Applied: `AppText` is the sole owner of typography (`app-text.css`); `AppBadge` renders `AppText`; `MemeCard` and `ThemeToggle` are `AppButton`; `AppMarquee` is added to the primitives. `figcaption` and `time` (the `li`s are structural: the text inside goes through `AppText`) also go through `AppText` (`as`).
