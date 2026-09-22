# Component catalog

Living documentation (rule 07): every component in `app/components/` has a `### <Name>` block here. The
`tests/arch/docs-sync.spec.ts` test fails if one is created without a block, or if a block points to a
deleted component. **Before creating a new component, look for one here that already does it** (decision 027).

Common conventions:

- Primitives in `app/components/shared/Custom*` (decisions 026, 038): every native text, form, link, or
  image element goes through its primitive. ESLint (`vue/no-restricted-html-elements`) forbids in `app/**`
  `p, span, h1-h6, small, strong, em, label` (→ `CustomText`), `input, select, textarea` (→ `CustomInput`),
  `button` (→ `CustomButton`), `a` (→ `CustomLink`), `img` (→ `CustomImage`). Structural elements (`div`, `section`,
  `header`, `footer`, `nav`, `ul`, `ol`, `li`, `figure`, `form`, `fieldset`, `legend`, `article`) are native.
- **Typography** (size, weight, text color) is set only by `CustomText` (`custom-text.css`). The CSS of the
  rest of the components only carries layout/spacing/background/borders.
- Each component has a single BEM CSS block at `app/assets/css/components/<kebab>.css`, imported from
  `main.css`. Only classes from that block are used in the template (rule 08, `tests/arch/css-per-component.spec.ts`).
- No user-facing string in the template: everything goes through `useI18n()` (rule 05).
- `Tone` = `primary | secondary | neutral | success | info | warning | danger`; `Size` = `sm | md | lg`
  (`app/types/ui.ts`).
- Icons always go through `CustomIcon` and must be registered in `app/plugins/fontawesome.ts`.
- Components are registered by filename without a folder prefix (`nuxt.config.ts` →
  `components: [{ path: '~/components', pathPrefix: false }]`).

Block template:

```md
### Component name

- **Path**: `app/components/<folder>/ComponentName.vue`
- **Purpose**: one line.
- **Props**: table of name / type / default / allowed values → CSS class it activates.
- **Variants/classes**: CSS block and modifiers.
- **Slots**: …
- **Events**: …
- **Example**: minimal snippet.
- **Consumers**: where it's used.
```

---

## Primitives (`app/components/shared/`)

### CustomText

- **Path**: `app/components/shared/CustomText.vue`
- **Purpose**: sole owner of typography. Renders the `as` tag with the scale from `custom-text.css`.
  All attributes (`id`, `datetime`, `for`, `aria-*`, `data-testid`, `class`) fall through to the element.
- **Props**:

| Prop       | Type                                                                                                                 | Default     | Allowed values → class                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `as`       | `'p' \| 'span' \| 'h1'…'h6' \| 'small' \| 'strong' \| 'em' \| 'label' \| 'figcaption' \| 'time' \| 'li'`             | `'p'`       | rendered HTML tag (does not affect the style)                                                                  |
| `variant`  | `'display' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'lead' \| 'body' \| 'small' \| 'caption' \| 'eyebrow'` | `'body'`    | `.custom-text--<variant>` (default size + weight, see `styles.md`)                                             |
| `tone`     | `'default' \| 'muted' \| Tone`                                                                                       | `'default'` | `.custom-text--tone-<tone>` (`default` inherits the color, `muted` = `text-text-muted`, tones = `text-<tone>`) |
| `weight`   | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                                                       | —           | `.custom-text--<weight>` (overrides the variant's weight)                                                      |
| `align`    | `'start' \| 'center' \| 'end'`                                                                                       | —           | `.custom-text--align-<align>`                                                                                  |
| `truncate` | `boolean`                                                                                                            | `false`     | `.custom-text--truncate` (single line with ellipsis)                                                           |

- **Variants/classes**: `.custom-text` + the above. Size/weight/color are never added from any other CSS.
- **Slots**: `default`.
- **Events**: none.
- **Example**:

```vue
<CustomText as="h1" variant="display">{{ profile.name }}</CustomText>
<CustomText
  as="p"
  variant="eyebrow"
  tone="primary"
><CustomIcon name="user" size="sm" />{{ t('about.eyebrow') }}</CustomText>
<CustomText as="time" variant="small" tone="muted" :datetime="item.start">{{ period }}</CustomText>
<CustomText
  v-for="(b, i) in bullets"
  :key="i"
  as="li"
  variant="small"
  tone="muted"
>{{ b }}</CustomText>
```

- **Consumers**: all components with text (CustomAlert, CustomBadge, CustomInput, CustomSection, HeroSection,
  AboutSection, ExperienceItem, TechStack, EducationSection, ContactSection, AppFooter, SourceBanner, MemeCard,
  MemePreview, `pages/meme.vue`).

### CustomLink

- **Path**: `app/components/shared/CustomLink.vue`
- **Purpose**: sole wrapper for text/icon links: `to` → `NuxtLinkLocale` (or `NuxtLink` if
  `localize=false`), `href` → `<a>` (external `https?://` → `target=_blank rel=noopener noreferrer`; anchor `#id`;
  `mailto:`). Attributes (`class`, `aria-*`, `title`, `lang`, `tabindex`, `data-testid`) fall through to the element.
- **Props**:

| Prop          | Type                                      | Default                 | Allowed values → class                                                                                                                        |
| ------------- | ----------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `to`          | `string`                                  | `''`                    | internal route                                                                                                                                |
| `href`        | `string`                                  | `''`                    | external URL, anchor, or `mailto:`                                                                                                            |
| `variant`     | `'inline' \| 'nav' \| 'subtle' \| 'icon'` | `'inline'`              | `.custom-link--inline` (underline on hover), `--nav` (pill with active state), `--subtle` (color only on hover), `--icon` (centered 36px box) |
| `tone`        | `'default' \| Tone`                       | `'default'`             | `.custom-link--tone-<tone>` (`default` inherits the color)                                                                                    |
| `activeClass` | `string`                                  | `'custom-link--active'` | router's active class (only with `to`); `.custom-link--nav.custom-link--active`                                                               |
| `download`    | `boolean \| string`                       | —                       | passed to `<a download>`                                                                                                                      |
| `localize`    | `boolean`                                 | `true`                  | `false` → `NuxtLink` with no locale prefix (already-localized routes)                                                                         |

- **Variants/classes**: `.custom-link`, `--inline/--nav/--subtle/--icon`, `--tone-*`, `--active`.
- **Slots**: `default`.
- **Events**: none of its own (`@click` falls through to the element).
- **Example**:

```vue
<CustomLink to="/meme" variant="nav">{{ t('nav.meme') }}</CustomLink>
<CustomLink :href="profile.repo" variant="inline">{{ t('footer.source') }}</CustomLink>
<CustomLink
  :href="profile.github"
  variant="icon"
  :aria-label="t('contact.github')"
><CustomIcon name="github" set="brands" /></CustomLink>
<CustomLink :to="switchLocalePath('ca')" :localize="false" variant="subtle">ca</CustomLink>
```

- **Consumers**: AppHeader (brand + nav), AppFooter, LocaleSwitcher, ExperienceItem (org), SourceBanner,
  `layouts/default.vue` (skip link).

### CustomImage

- **Path**: `app/components/shared/CustomImage.vue`
- **Purpose**: sole wrapper for `<img>` (decision 018: no `@nuxt/image`). `inheritAttrs: false` + `v-bind="$attrs"`
  on the `<img>`: `class`, `fetchpriority`, `data-testid`… reach the image.
- **Props**:

| Prop      | Type                                       | Default   | Allowed values → class                                                          |
| --------- | ------------------------------------------ | --------- | ------------------------------------------------------------------------------- |
| `src`     | `string` (required)                        | —         |                                                                                 |
| `alt`     | `string` (required)                        | —         | translated text or meme title                                                   |
| `width`   | `number \| string`                         | —         |                                                                                 |
| `height`  | `number \| string`                         | —         |                                                                                 |
| `loading` | `'lazy' \| 'eager'`                        | `'lazy'`  |                                                                                 |
| `fit`     | `'cover' \| 'contain'`                     | `'cover'` | `.custom-image--fit-cover` / `--fit-contain`                                    |
| `radius`  | `'none' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'none'`  | `.custom-image--radius-none/-md/-lg/-xl/-full` (`rounded-none/md/lg/3xl/full`)  |
| `frame`   | `boolean`                                  | `false`   | `.custom-image--frame` (`border` + `shadow-lg`)                                 |
| `srcset`  | `string \| undefined`                      | —         | reflected as-is on `<img srcset>`; not yet actually used (decision 037)         |
| `sizes`   | `string \| undefined`                      | —         | reflected as-is on `<img sizes>`; only has an effect if `srcset` is also passed |

- **Variants/classes**: `.custom-image` (`block max-w-full`) + the above.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<CustomImage
  :src="image"
  :alt="alt"
  width="800"
  height="800"
  loading="eager"
  radius="xl"
  frame
  data-testid="hero-image"
/>
```

- **Consumers**: HeroSection, MemeCard, MemePreview.

### CustomInput

- **Path**: `app/components/shared/CustomInput.vue`
- **Purpose**: sole wrapper for forms, native elements only. `type` decides the control; generic `v-model`
  (`T extends string | number | boolean | Array<string|number> | null`), typed by the consumer.
- **Props**:

| Prop               | Type                                                                                                            | Default     | Allowed values → class                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `id`               | `string` (required)                                                                                             | —           | control id (and label's `for`); for `radio`, prefix `<id>-<value>`              |
| `label`            | `string` (required)                                                                                             | —           | label (`CustomText small medium`); `legend` for `radio`                         |
| `type`             | `'text' \| 'search' \| 'email' \| 'number' \| 'textarea' \| 'select' \| 'multiselect' \| 'radio' \| 'checkbox'` | `'text'`    | `.custom-input--<type>`                                                         |
| `options`          | `{ value: string \| number; label: string; disabled?: boolean }[]`                                              | `[]`        | `select`, `multiselect`, `radio`                                                |
| `placeholder`      | `string`                                                                                                        | `''`        | text/textarea/number; for `select` it's an empty disabled option                |
| `icon`             | `string`                                                                                                        | `''`        | only `text/search/email` → `.custom-input--with-icon` (left padding)            |
| `size`             | `Size`                                                                                                          | `'md'`      | `.custom-input--sm/--md/--lg` (height 32/40/48)                                 |
| `tone`             | `'neutral' \| 'danger'`                                                                                         | `'neutral'` | `.custom-input--danger` → red border + `aria-invalid="true"` + hint in `danger` |
| `hint`             | `string`                                                                                                        | `''`        | `CustomText caption` with `id="<id>-hint"` → `aria-describedby`                 |
| `hideLabel`        | `boolean`                                                                                                       | `false`     | `sr-only` label                                                                 |
| `disabled`         | `boolean`                                                                                                       | `false`     | `.custom-input--disabled` + `disabled` on the control                           |
| `required`         | `boolean`                                                                                                       | `false`     | `required` on the control (`aria-required` on the fieldset)                     |
| `rows`             | `number`                                                                                                        | `4`         | `textarea` only                                                                 |
| `min`/`max`/`step` | `number`                                                                                                        | —           | `number` only                                                                   |
| `name`             | `string`                                                                                                        | `id`        | `radio` group name                                                              |

- **Model**: `defineModel<T>()`. `number` emits `number` (or `null` when cleared); `select` emits the typed
  `value` of the option; `multiselect` an array; `checkbox` a `boolean`; `radio` the `value` of the chosen option.
- **Variants/classes**: `.custom-input`, `--<type>`, `--sm/--md/--lg`, `--neutral/--danger`, `--with-icon`,
  `--disabled`; elements `__label`, `__field`, `__icon`, `__control` (input/select/textarea), `__group`
  (fieldset), `__options`, `__option`, `__radio`, `__checkbox`, `__hint`. `--select` adds a CSS-only chevron on
  `__field::after` (same border-trick as the checkbox tick, no icon/dependency).
- **Slots**: none.
- **Events**: `update:modelValue`.
- **Example**:

```vue
<CustomInput
  id="meme-query"
  v-model="query"
  :label="t('meme.search.label')"
  icon="magnifying-glass"
  type="search"
  hide-label
/>
<CustomInput
  id="fw"
  v-model="framework"
  type="select"
  :label="t('x.fw')"
  :options="[{ value: 'vue', label: 'Vue' }]"
/>
<CustomInput id="ok" v-model="agree" type="checkbox" :label="t('x.agree')" />
<CustomInput
  id="lvl"
  v-model="level"
  type="radio"
  :label="t('x.level')"
  :options="levels"
  tone="danger"
  :hint="t('x.required')"
/>
```

- **Consumers**: MemeSearch. Test: `tests/unit/components/CustomInput.spec.ts`.

### CustomButton

- **Path**: `app/components/shared/CustomButton.vue`
- **Purpose**: polymorphic button/link: `<button>` by default, `<a>` with `href`, `NuxtLinkLocale` with `to`. It is
  the only place with a button-style `<button>`/`<a>` (text links go through `CustomLink`).
- **Props**:

| Prop       | Type                              | Default     | Allowed values → class                                                                   |
| ---------- | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `tone`     | `Tone`                            | `'primary'` | `.custom-button--<tone>` (combined with the variant)                                     |
| `size`     | `Size`                            | `'md'`      | `.custom-button--sm/--md/--lg` (height 32/40/48)                                         |
| `variant`  | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | `.custom-button--solid/--outline/--ghost`                                                |
| `icon`     | `string`                          | `''`        | `CustomIcon` before the slot (`.custom-button__icon`)                                    |
| `iconSet`  | `'solid' \| 'brands'`             | `'solid'`   |                                                                                          |
| `to`       | `string`                          | `''`        | internal route → `NuxtLinkLocale`                                                        |
| `href`     | `string`                          | `''`        | external URL (`https?://` → `target=_blank` + `rel=noopener noreferrer`) or `#id` anchor |
| `type`     | `'button' \| 'submit'`            | `'button'`  | only when rendering `<button>`                                                           |
| `loading`  | `boolean`                         | `false`     | `.custom-button--loading` + `aria-busy="true"` + disabled                                |
| `disabled` | `boolean`                         | `false`     | `disabled` (button) or `aria-disabled` (links)                                           |
| `block`    | `boolean`                         | `false`     | `.custom-button--block` (full width)                                                     |

- **Variants/classes**: `.custom-button`, sizes, variants × tones (`.custom-button--solid.custom-button--primary`…), states `--loading`, `--block`; element `__icon`. The button text (`text-sm font-medium`) belongs to the primitive.
- **Slots**: `default` (label; optional for icon-only buttons with `aria-label`).
- **Events**: none of its own; attributes/listeners (`@click`, `data-testid`, `download`, `aria-pressed`) fall through to the root.
- **Example**:

```vue
<CustomButton
  tone="danger"
  variant="outline"
  icon="xmark"
  @click="remove"
>{{ t('x.remove') }}</CustomButton>
<CustomButton href="https://github.com/…" icon="github" icon-set="brands">GitHub</CustomButton>
<CustomButton to="/meme" size="sm" variant="ghost">{{ t('hero.tryMeme') }}</CustomButton>
<CustomButton
  variant="ghost"
  tone="neutral"
  icon="moon"
  :aria-label="t('theme.toggle')"
  class="theme-toggle"
/>
```

- **Consumers**: `pages/meme.vue`, ContactSection, CvDownload, HeroSection, MemePreview, MemeSearch, MemeCard
  (card = button), ThemeToggle.

### CustomIcon

- **Path**: `app/components/shared/CustomIcon.vue`
- **Purpose**: sole wrapper for Font Awesome; the rest of the code is forbidden from importing `@fortawesome/vue-fontawesome`.
- **Props**:

| Prop    | Type                  | Default   | Allowed values → class                                        |
| ------- | --------------------- | --------- | ------------------------------------------------------------- |
| `name`  | `string` (required)   | —         | name without prefix, registered in `plugins/fontawesome.ts`   |
| `set`   | `'solid' \| 'brands'` | `'solid'` |                                                               |
| `size`  | `Size`                | `'md'`    | `.custom-icon--sm/--md/--lg` (`text-sm/base/2xl`)             |
| `label` | `string`              | `''`      | if passed → `aria-label` + `title`; otherwise → `aria-hidden` |

- **Variants/classes**: `.custom-icon`, `--sm/--md/--lg`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<CustomIcon name="github" set="brands" size="sm" />
<CustomIcon name="envelope" :label="t('contact.email')" />
```

- **Consumers**: CustomAlert, CustomBadge, CustomButton, CustomInput, CustomSection, AppFooter, EducationSection, HeroSection,
  TechStack, SourceBanner.

### CustomBadge

- **Path**: `app/components/shared/CustomBadge.vue`
- **Purpose**: inline label (tags, languages, "open to work"). It is a `CustomText as="span"` (`caption` for `sm`,
  `small` for `md`/`lg`, `weight="medium"`) with its own background and shape.
- **Props**:

| Prop      | Type                | Default     | Allowed values → class                                                                 |
| --------- | ------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `tone`    | `Tone`              | `'neutral'` | `.custom-badge--<tone>` (combined with the variant)                                    |
| `variant` | `'soft' \| 'solid'` | `'soft'`    | `.custom-badge--soft` (`-soft` background, tone's text) / `--solid` (solid background) |
| `size`    | `Size`              | `'sm'`      | `.custom-badge--sm/--md/--lg` (padding) + `CustomText` variant                         |
| `icon`    | `string`            | `''`        | icon before the text                                                                   |

- **Variants/classes**: `.custom-badge`, `--sm/--md/--lg`, `--soft`/`--solid` × tones.
- **Slots**: `default`.
- **Events**: none.
- **Example**:

```vue
<CustomBadge tone="success" icon="circle-check">{{ t('hero.openToWork') }}</CustomBadge>
<CustomBadge size="md">Vue 3</CustomBadge>
```

- **Consumers**: AboutSection, ExperienceItem, HeroSection, TechStack.

### CustomAlert

- **Path**: `app/components/shared/CustomAlert.vue`
- **Purpose**: status message with icon; `role="alert"` for `danger`/`warning`, `role="status"` for the rest.
  The title is `CustomText small semibold`; the slot content is `text-sm` (belongs to the primitive).
- **Props**:

| Prop    | Type     | Default  | Allowed values → class                                                             |
| ------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `tone`  | `Tone`   | `'info'` | `.custom-alert--<tone>` (border + `-soft` background, tone-colored icon and title) |
| `title` | `string` | `''`     | `.custom-alert__title`                                                             |
| `icon`  | `string` | `''`     | overrides the tone's default icon                                                  |

Default icons: `circle-info` (primary/secondary/neutral/info), `circle-check` (success), `triangle-exclamation` (warning), `circle-xmark` (danger).

- **Variants/classes**: `.custom-alert`, `--primary … --danger`; elements `__icon`, `__body`, `__title`, `__content`.
- **Slots**: `default` (content, supports `CustomText` and inline buttons).
- **Events**: none.
- **Example**:

```vue
<CustomAlert tone="danger" :title="t('meme.results.errorTitle')">{{ t(errorKey) }}</CustomAlert>
```

- **Consumers**: `pages/meme.vue`, MemeGrid.

### CustomCard

- **Path**: `app/components/shared/CustomCard.vue`
- **Purpose**: container with border/background/shadow and configurable padding; configurable root tag.
- **Props**:

| Prop      | Type                                  | Default     | Allowed values → class                             |
| --------- | ------------------------------------- | ----------- | -------------------------------------------------- |
| `as`      | `string`                              | `'div'`     | structural tag (`div`, `section`, `article`…)      |
| `variant` | `'outline' \| 'filled' \| 'elevated'` | `'outline'` | `.custom-card--outline/--filled/--elevated`        |
| `padding` | `Size`                                | `'md'`      | `.custom-card--padding-sm/-md/-lg` (`p-3/p-5/p-8`) |

- **Variants/classes**: `.custom-card` (`rounded-xl`), variants, paddings; elements `__header`, `__footer`.
- **Slots**: `default`, `header` (optional), `footer` (optional).
- **Events**: none.
- **Example**:

```vue
<CustomCard variant="filled" padding="md">
  <template #header><CustomText as="h2" variant="body" weight="semibold">…</CustomText></template>
  …
</CustomCard>
```

- **Consumers**: `pages/meme.vue`, MemePreview.

### CustomSection

- **Path**: `app/components/shared/CustomSection.vue`
- **Purpose**: CV section with `id` (anchor), eyebrow (`CustomText eyebrow primary` + icon), title
  (`CustomText h2`), and subtitle (`CustomText body muted`); automatic `aria-labelledby`. `cv/*` sections read
  their title/eyebrow/icon from `ui-config/cv/sections.ts`.
- **Props**:

| Prop       | Type                | Default | Allowed values → class                           |
| ---------- | ------------------- | ------- | ------------------------------------------------ |
| `id`       | `string` (required) | —       | section id (`about`, `stack`…)                   |
| `title`    | `string` (required) | —       | `.custom-section__title` (`h2`, id `<id>-title`) |
| `eyebrow`  | `string`            | `''`    | `.custom-section__eyebrow`                       |
| `icon`     | `string`            | `''`    | only shown when an eyebrow is present            |
| `subtitle` | `string`            | `''`    | `.custom-section__subtitle`                      |

- **Variants/classes**: `.custom-section` (vertical padding + `scroll-mt`); elements `__header`, `__eyebrow`, `__title`, `__subtitle`.
- **Slots**: `default`.
- **Events**: none.
- **Example**:

```vue
<CustomSection
  :id="config.id"
  :title="t(config.titleKey)"
  :eyebrow="t(config.eyebrowKey)"
  :icon="config.icon"
  class="tech-stack"
>…</CustomSection>
```

- **Consumers**: AboutSection, ContactSection, EducationSection, ExperienceSection, TechStack.

### CustomSkeleton

- **Path**: `app/components/shared/CustomSkeleton.vue`
- **Purpose**: animated placeholder while loading (`aria-hidden`).
- **Props**:

| Prop    | Type                            | Default  | Allowed values → class                                          |
| ------- | ------------------------------- | -------- | --------------------------------------------------------------- |
| `shape` | `'text' \| 'image' \| 'circle'` | `'text'` | `.custom-skeleton--text` (line), `--image` (square), `--circle` |

- **Variants/classes**: `.custom-skeleton`, `--text`, `--image`, `--circle`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<CustomSkeleton v-for="n in 8" :key="n" shape="image" />
```

- **Consumers**: MemeGrid.

### CustomMarquee

- **Path**: `app/components/shared/CustomMarquee.vue`
- **Purpose**: infinite horizontal banner. Renders the slot twice inside a track that loops
  `translateX(-50%)` (`@keyframes custom-marquee-scroll`). The second copy is `aria-hidden="true"` + `inert`;
  the slot receives `duplicate` so the copy's links can set `tabindex="-1"`. With `prefers-reduced-motion:
reduce` there is no animation and only the first copy is visible. `div` container with `aria-label` (no `role`).
- **Props**:

| Prop           | Type                           | Default     | Allowed values → class                                             |
| -------------- | ------------------------------ | ----------- | ------------------------------------------------------------------ |
| `label`        | `string` (required)            | —           | `aria-label` (i18n)                                                |
| `speed`        | `'slow' \| 'normal' \| 'fast'` | `'normal'`  | `.custom-marquee--slow/--normal/--fast` (duration 70s / 40s / 20s) |
| `pauseOnHover` | `boolean`                      | `true`      | `.custom-marquee--pause` (pauses on `:hover` and `:focus-within`)  |
| `tone`         | `Tone`                         | `'primary'` | `.custom-marquee--<tone>` (`-soft` background + tone's text)       |
| `size`         | `Size`                         | `'md'`      | `.custom-marquee--sm/--md/--lg` (copy's vertical padding)          |

- **Variants/classes**: `.custom-marquee`, `__track`, `__copy` + the above modifiers.
- **Slots**: `default` with `{ duplicate: boolean }` prop.
- **Events**: none.
- **Example**:

```vue
<CustomMarquee :label="t('banner.label')" speed="normal" tone="primary" size="sm">
  <template #default="{ duplicate }">
    <CustomText as="span" variant="small">… <CustomLink :href="repo" :tabindex="duplicate ? -1 : undefined">…</CustomLink></CustomText>
  </template>
</CustomMarquee>
```

- **Consumers**: SourceBanner. Test: `tests/unit/components/CustomMarquee.spec.ts`.

### CustomPagination

- **Path**: `app/components/shared/CustomPagination.vue`
- **Purpose**: generic navigation for paginated results (decision 034). `pageCount` is computed from
  `total`/`perPage` and rendered inside a `<nav>`; it hides itself when there is only one page. Previous/next
  buttons (`CustomButton` ghost, icon-only) disabled at the extremes.
- **Props**:

| Prop      | Type                | Default | Allowed values → class                                      |
| --------- | ------------------- | ------- | ----------------------------------------------------------- |
| `page`    | `number` (required) | —       | current page, **1-indexed**                                 |
| `total`   | `number` (required) | —       | total number of paginable items (not pages)                 |
| `perPage` | `number`            | `12`    | items per page; `pageCount = max(1, ceil(total / perPage))` |

- **Variants/classes**: `.custom-pagination` (`<nav>`, hidden if `pageCount <= 1`); element `__status`.
- **Slots**: none.
- **Events**: `update:page: [page: number]` (supports `v-model:page`); only emitted if the target page
  (clamped to `[1, pageCount]`) differs from the current one.
- **Example**:

```vue
<CustomPagination v-model:page="page" :total="giphy.total" :per-page="giphy.limit" />
```

- **Consumers**: `pages/meme.vue`. Test: `tests/unit/components/CustomPagination.spec.ts`.

---

## Layout (`app/components/layout/`)

### AppHeader

- **Path**: `app/components/layout/AppHeader.vue`
- **Purpose**: fixed header with navigation (`/`, `/meme`) via `CustomLink nav` (active state, `.app-header__link--active`,
  a raised chip — deliberate deviation from `CustomLink`'s default sunken `--active`, via the `activeClass` prop; see
  decision 044), and tools (language, theme). No brand text (removed, criterion 1).
- **Props**: none.
- **Variants/classes**: `.app-header`; elements `__inner`, `__nav`, `__link`, `__link--active`, `__tools`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<AppHeader />
```

- **Consumers**: `layouts/default.vue`.

### SourceBanner

- **Path**: `app/components/layout/SourceBanner.vue`
- **Purpose**: marquee (`CustomMarquee` `primary`/`sm`) announcing that the code is public: 4 copies of a
  single `CustomLink` (`variant="inline"`) to `profile.repo`, wrapping `CustomIcon code` + `CustomText`
  (`banner.source` + `banner.repo`) — the whole item is clickable, not just the repo name (fixed 2026-09-18).
  `data-testid="source-banner"`. Sits in `layouts/default.vue` between `AppHeader` and `main`.
- **Props**: none.
- **Variants/classes**: `.source-banner` (bottom border); elements `__item`, `__icon`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<SourceBanner />
```

- **Consumers**: `layouts/default.vue`. E2E: "home renders CV sections".

### AppFooter

- **Path**: `app/components/layout/AppFooter.vue`
- **Purpose**: footer with copyright (`CustomText small muted`, `footer.copyright` with `{ name, year }`, `year` from
  `computed(() => new Date().getFullYear())`), source link (`CustomLink inline`), and contact icons
  (`CustomLink icon`: GitHub, LinkedIn, email) from `data/cv`.
- **Props**: none.
- **Variants/classes**: `.app-footer`; elements `__inner`, `__source`, `__links`, `__link`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<AppFooter />
```

- **Consumers**: `layouts/default.vue`.

### ThemeToggle

- **Path**: `app/components/layout/ThemeToggle.vue`
- **Purpose**: icon-only `CustomButton ghost neutral` (`sun`/`moon`) over `useColorMode()` (`ClientOnly`, empty
  `div` fallback to avoid hydration mismatch). `data-testid="theme-toggle"`, `aria-pressed` when dark.
- **Props**: none.
- **Variants/classes**: `.theme-toggle` (40×40 box with no padding, over `.custom-button`).
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<ThemeToggle />
```

- **Consumers**: AppHeader.

### LocaleSwitcher

- **Path**: `app/components/layout/LocaleSwitcher.vue`
- **Purpose**: `CustomInput type="select"` bound to `useI18n().locale`; on change, navigates via
  `useSwitchLocalePath()` + `navigateTo()` (not plain `v-model`). Options are `locales[].name` from
  `nuxt.config.ts`. `data-testid="locale-switcher"` on the outer root. See decision 043.
- **Props**: none.
- **Variants/classes**: `.locale-switcher` (`w-32`, layout width only — look is `CustomInput`'s, per decision 026).
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<LocaleSwitcher />
```

- **Consumers**: AppHeader.

---

## CV (`app/components/cv/`)

### HeroSection

- **Path**: `app/components/cv/HeroSection.vue`
- **Purpose**: CV header: greeting (`CustomText lead muted`), name (`CustomText h1 display`), headline
  (`CustomText h3 primary`), tagline (`body muted`), location (`small muted` + icon), badge, contact CTA,
  CV download, and portrait (`CustomImage radius=xl frame`, `data-testid="hero-image"`). The portrait is replaced
  by the meme from `useHeroStore` (`hero.selected.full`) and the `figcaption` (`CustomText small muted`) shows the
  reset button (`data-testid="hero-reset"`).
- **Props**: none.
- **Variants/classes**: `.hero-section`; elements `__content`, `__greeting`, `__name`, `__headline`, `__tagline`, `__meta`, `__meta-item`, `__actions`, `__figure`, `__image` (`aspect-square`), `__image--meme` (`primary` border), `__caption`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<HeroSection />
```

- **Consumers**: `pages/index.vue`.

### AboutSection

- **Path**: `app/components/cv/AboutSection.vue`
- **Purpose**: `#about` section (config `getSectionConfig('about')`): two paragraphs (`CustomText body muted`), languages
  and interests (titles `CustomText h3 eyebrow muted` + badges) from `profile`.
- **Props**: none.
- **Variants/classes**: `.about-section` (root), `__grid`, `__text`, `__aside`, `__aside-title`, `__list`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<AboutSection />
```

- **Consumers**: `pages/index.vue` (via `homeSections`).

### ExperienceSection

- **Path**: `app/components/cv/ExperienceSection.vue`
- **Purpose**: `#experience` section: lists `experience` from `data/cv` with `ExperienceItem` in `detailed` variant.
- **Props**: none.
- **Variants/classes**: `.experience-section` (root), `__list`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<ExperienceSection />
```

- **Consumers**: `pages/index.vue` (via `homeSections`).

### ExperienceItem

- **Path**: `app/components/cv/ExperienceItem.vue`
- **Purpose**: timeline entry (job, education, or certification). Text via i18n at `<section>.items.<id>`
  (`title`, `bullets[]` via `useMessageList`, `note`); period via `formatPeriod` (`~/domain/cv/period`) and the
  active locale. Typography: period `CustomText small muted` (+ `time`), title `h3 h4`, org `body muted`
  (`CustomLink inline` if it has a URL), location `span small muted`, bullets `li small muted`, note `small muted`.
  `--detailed`'s connecting line (`border-l-2`, on `.experience-item`) runs continuous through the item's own
  `pb-8` (in place of the list's `gap-8`, removed) instead of breaking between items; trimmed to `pb-0` on the
  list's last item.
- **Props**:

| Prop      | Type                      | Default      | Allowed values → class                                                   |
| --------- | ------------------------- | ------------ | ------------------------------------------------------------------------ |
| `item`    | `TimelineItem` (required) | —            | `app/domain/cv/types.ts`                                                 |
| `variant` | `'detailed' \| 'compact'` | `'detailed'` | `.experience-item--detailed` (bullets) / `--compact` (note, neutral dot) |

- **Variants/classes**: `.experience-item`, `--detailed`, `--compact`; elements `__period`, `__body`, `__title`, `__org`, `__org-link`, `__bullets`, `__note`, `__tags`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<ExperienceItem :item="item" variant="compact" />
```

- **Consumers**: ExperienceSection, EducationSection.

### TechStack

- **Path**: `app/components/cv/TechStack.vue`
- **Purpose**: `#stack` section: `stack` groups (`data/cv`) with a title (`CustomText h3 body semibold` + icon) and badges.
- **Props**: none.
- **Variants/classes**: `.tech-stack` (root), `__groups`, `__group`, `__group-title`, `__list`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<TechStack />
```

- **Consumers**: `pages/index.vue` (via `homeSections`).

### EducationSection

- **Path**: `app/components/cv/EducationSection.vue`
- **Purpose**: `#education` section: education and, under a subtitle (`CustomText h3 lead semibold` + `certificate`
  icon), certifications; all via `ExperienceItem` `compact`.
- **Props**: none.
- **Variants/classes**: `.education-section` (root), `__list`, `__subtitle`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<EducationSection />
```

- **Consumers**: `pages/index.vue` (via `homeSections`).

### ContactSection

- **Path**: `app/components/cv/ContactSection.vue`
- **Purpose**: `#contact` section: intro (`CustomText body muted`) and buttons for email, LinkedIn, GitHub, and CV download.
- **Props**: none.
- **Variants/classes**: `.contact-section` (root), `__intro`, `__actions`.
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<ContactSection />
```

- **Consumers**: `pages/index.vue` (via `homeSections`).

### CvDownload

- **Path**: `app/components/cv/CvDownload.vue`
- **Purpose**: download button for the per-language CV PDF (`/cv/cv-<locale>.pdf`, `download` attribute). Rule 04: the PDF carries no phone or address.
- **Props**:

| Prop      | Type                              | Default     | Allowed values → class   |
| --------- | --------------------------------- | ----------- | ------------------------ |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | passed to `CustomButton` |
| `tone`    | `Tone`                            | `'primary'` | passed to `CustomButton` |
| `size`    | `Size`                            | `'md'`      | passed to `CustomButton` |

- **Variants/classes**: `.cv-download` (inline-flex `div`; the visual style is `CustomButton`'s).
- **Slots**: none.
- **Events**: none.
- **Example**:

```vue
<CvDownload variant="outline" />
<CvDownload variant="ghost" tone="neutral" />
```

- **Consumers**: HeroSection, ContactSection.

---

## Meme (`app/components/meme/`)

### MemeSearch

- **Path**: `app/components/meme/MemeSearch.vue`
- **Purpose**: `role="search"` form with `CustomInput type=search` (`id="meme-query"`) and a search button
  (`data-testid="meme-search-submit"`, disabled if the query is empty). Emits the trimmed query on submit.
  `initial` is reactive: a `watch` re-syncs the field if it changes after mount (e.g. when clicking a
  recent search in `MemeRecentSearches`).
- **Props**:

| Prop      | Type      | Default | Allowed values                       |
| --------- | --------- | ------- | ------------------------------------ |
| `loading` | `boolean` | `false` | passed to `CustomButton` (`loading`) |
| `initial` | `string`  | `''`    | field value (initial and reactive)   |

- **Variants/classes**: `.meme-search`, `__input`.
- **Slots**: none.
- **Events**: `search: [query: string]`.
- **Example**:

```vue
<MemeSearch :loading="giphy.status === 'pending'" :initial="giphy.query" @search="onSearch" />
```

- **Consumers**: `pages/meme.vue`.

### MemeGrid

- **Path**: `app/components/meme/MemeGrid.vue`
- **Purpose**: results grid based on `status` (`pending` → skeletons `data-testid="meme-skeletons"`;
  `error` → `CustomAlert danger` with `t(errorKey)`; `success` with no results → `CustomAlert info`; otherwise a list of
  `MemeCard`). `aria-live="polite"`.
- **Props**:

| Prop         | Type                                | Default                | Allowed values                                           |
| ------------ | ----------------------------------- | ---------------------- | -------------------------------------------------------- |
| `items`      | `Meme[]` (required)                 | —                      | `#shared/types/giphy`                                    |
| `status`     | `AsyncDataRequestStatus` (required) | —                      | `idle`, `pending`, `success`, `error`                    |
| `selectedId` | `string \| null`                    | `null`                 | id of the meme marked as selected                        |
| `skeletons`  | `number`                            | `8`                    | number of placeholders                                   |
| `errorKey`   | `string`                            | `'meme.results.error'` | i18n key for the message (from `useGiphyStore.errorKey`) |

- **Variants/classes**: `.meme-grid`, `__skeletons`, `__list`, `__state`.
- **Slots**: none.
- **Events**: `select: [meme: Meme]` (re-emitted from `MemeCard`).
- **Example**:

```vue
<MemeGrid
  :items="giphy.items"
  :status="giphy.status"
  :error-key="giphy.errorKey"
  :selected-id="candidate?.id ?? null"
  @select="candidate = $event"
/>
```

- **Consumers**: `pages/meme.vue`.

### MemeCard

- **Path**: `app/components/meme/MemeCard.vue`
- **Purpose**: GIF card-button: `CustomButton ghost neutral` with `CustomImage` (`preview`, lazy) and a title
  (`CustomText span caption truncate`, visible on hover/focus/selected); translated `aria-pressed` and `aria-label`;
  `data-testid="meme-card"`.
- **Props**:

| Prop       | Type              | Default | Allowed values → class                         |
| ---------- | ----------------- | ------- | ---------------------------------------------- |
| `meme`     | `Meme` (required) | —       | `#shared/types/giphy`                          |
| `selected` | `boolean`         | `false` | `.meme-card--selected` + `aria-pressed="true"` |

- **Variants/classes**: `.meme-card` (square, over `.custom-button`), `--selected`; elements `__image`, `__title`.
- **Slots**: none.
- **Events**: `select: [meme: Meme]`.
- **Example**:

```vue
<MemeCard :meme="meme" :selected="meme.id === selectedId" @select="onSelect" />
```

- **Consumers**: MemeGrid. Test: `tests/unit/components/MemeCard.spec.ts`.

### MemePreview

- **Path**: `app/components/meme/MemePreview.vue`
- **Purpose**: full-size preview (`CustomImage full radius=lg`) inside a `CustomCard elevated`, with a title
  (`CustomText lead semibold`), size (`small muted`), and "wear it" (`data-testid="meme-use"`) / "choose another"
  buttons. Container `data-testid="meme-preview"`.
- **Props**:

| Prop   | Type              | Default | Allowed values        |
| ------ | ----------------- | ------- | --------------------- |
| `meme` | `Meme` (required) | —       | `#shared/types/giphy` |

- **Variants/classes**: `.meme-preview`; elements `__image`, `__body`, `__title`, `__meta`, `__actions`.
- **Slots**: none.
- **Events**: `use: [meme: Meme]`, `cancel: []`.
- **Example**:

```vue
<MemePreview v-if="candidate" :meme="candidate" @use="wear" @cancel="candidate = null" />
```

- **Consumers**: `pages/meme.vue`.

### MemeRecentSearches

- **Path**: `app/components/meme/MemeRecentSearches.vue`
- **Purpose**: "recent searches" section below the `/meme` grid (decision 034). Shows the terms from
  `useGiphyStore.history` (max 5, most recent first) as clickable buttons; clicking one emits `select`
  with the term. Hides entirely (`v-if="terms.length"`) while there is no history yet.
- **Props**:

| Prop    | Type                  | Default | Allowed values          |
| ------- | --------------------- | ------- | ----------------------- |
| `terms` | `string[]` (required) | —       | `useGiphyStore.history` |

- **Variants/classes**: `.meme-recent-searches`; element `__list`.
- **Slots**: none.
- **Events**: `select: [term: string]`.
- **Example**:

```vue
<MemeRecentSearches :terms="giphy.history" @select="onSearch" />
```

- **Consumers**: `pages/meme.vue`. Test: `tests/unit/components/MemeRecentSearches.spec.ts`.
