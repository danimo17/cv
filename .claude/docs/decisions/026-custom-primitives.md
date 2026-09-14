# 026 · Tot passa per components propis (primitius)

**Context.** L'usuari vol que tot el que una llibreria com PrimeVue oferiria (inputs, text, botons, enllaços, imatges, targetes, badges, alertes, skeletons) passi per un únic component propi per tipus, per poder canviar d'estil o de plantilla en un sol lloc.
**Decisió.** Primitius a `app/components/shared/` (prefix `App`; el 'CustomInput'/'CustomText' de l'usuari són `AppInput`/`AppText`):

- `AppText`: tot `p`, `span`, `h1`..`h6`, `small`, `strong`, `em`, `label` de text. Props: `as`, `variant` (escala tipogràfica), `tone`, `weight`, `align`, `truncate`.
- `AppInput`: tot input. Props: `type` (`text|search|email|number|textarea|select|multiselect|radio|checkbox`), `options`, `label`, `hint`, `tone`, `size`, `icon`; `v-model` tipat.
- `AppLink`: tot `a` i `NuxtLinkLocale` de text. `AppImage`: tot `img`. Ja existents: `AppButton`, `AppIcon`, `AppBadge`, `AppAlert`, `AppCard`, `AppSection`, `AppSkeleton`.
- Els elements natius corresponents estan prohibits fora dels seus wrappers (`vue/no-restricted-html-elements`). Els estructurals (`div`, `section`, `ul`, `li`, `nav`, `header`, `footer`, `figure`, `form`, `time`) continuen sent natius.
  **Conseqüències.** Cada primitiu té CSS propi (regla 08) i bloc al catàleg amb TOTS els estils aplicables per props (regla 07). Un canvi d'estil global = tocar tokens + CSS dels primitius.

**Nota (2026-09-14).** Amb la decisió 029 la carpeta passa a `app/components/shared/`. Aplicat: `AppText` és l'únic propietari de la tipografia (`app-text.css`); `AppBadge` renderitza `AppText`; `MemeCard` i `ThemeToggle` són `AppButton`; `AppMarquee` s'afegeix als primitius. `figcaption` i `time` (els `li` són estructurals: el text de dins va en `AppText`) també van per `AppText` (`as`).
