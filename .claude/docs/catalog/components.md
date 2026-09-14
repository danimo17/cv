# Catàleg de components

Documentació viva (regla 07): cada component de `app/components/` té un bloc `### <Nom>` aquí. El test
`tests/arch/docs-sync.spec.ts` falla si se'n crea un sense bloc o si un bloc apunta a un component
esborrat. **Abans de crear un component nou, busca'n un aquí que ja ho faci** (decisió 027).

Convencions comunes:

- Primitius a `app/components/shared/App*` (decisió 026): tot element natiu de text, formulari, enllaç o
  imatge passa pel seu primitiu. ESLint (`vue/no-restricted-html-elements`) prohibeix a `app/**`
  `p, span, h1-h6, small, strong, em, label` (→ `AppText`), `input, select, textarea` (→ `AppInput`),
  `button` (→ `AppButton`), `a` (→ `AppLink`), `img` (→ `AppImage`). Els estructurals (`div`, `section`,
  `header`, `footer`, `nav`, `ul`, `ol`, `li`, `figure`, `form`, `fieldset`, `legend`, `article`) són natius.
- La **tipografia** (mida, pes, color de text) només la posa `AppText` (`app-text.css`). Els CSS de la resta de
  components només tenen layout/espai/fons/vores.
- Cada component té un únic bloc CSS (BEM) a `app/assets/css/components/<kebab>.css`, importat des de
  `main.css`. Al template només s'usen classes d'aquest bloc (regla 08, `tests/arch/css-per-component.spec.ts`).
- Cap string d'usuari al template: tot passa per `useI18n()` (regla 05).
- `Tone` = `primary | secondary | neutral | success | info | warning | danger`; `Size` = `sm | md | lg`
  (`app/types/ui.ts`).
- Les icones passen sempre per `AppIcon` i han d'estar registrades a `app/plugins/fontawesome.ts`.
- Els components es registren pel nom de fitxer sense prefix de carpeta (`nuxt.config.ts` →
  `components: [{ path: '~/components', pathPrefix: false }]`).

Plantilla d'un bloc:

```md
### Nom del component

- **Ruta**: `app/components/<carpeta>/NomComponent.vue`
- **Propòsit**: una línia.
- **Props**: taula nom / tipus / default / valors permesos → classe CSS que activa.
- **Variants/classes**: bloc CSS i modificadors.
- **Slots**: …
- **Events**: …
- **Exemple**: snippet mínim.
- **Consumidors**: on s'usa.
```

---

## Primitius (`app/components/shared/`)

### AppText

- **Ruta**: `app/components/shared/AppText.vue`
- **Propòsit**: únic propietari de la tipografia. Renderitza l'etiqueta `as` amb l'escala de `app-text.css`.
  Tots els atributs (`id`, `datetime`, `for`, `aria-*`, `data-testid`, `class`) cauen a l'element.
- **Props**:

| Prop       | Tipus                                                                                                    | Default     | Valors permesos → classe                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `as`       | `'p' \| 'span' \| 'h1'…'h6' \| 'small' \| 'strong' \| 'em' \| 'label' \| 'figcaption' \| 'time' \| 'li'` | `'p'`       | etiqueta HTML renderitzada (no afecta l'estil)                                                          |
| `variant`  | `'display' \| 'h1' \| 'h2' \| 'h3' \| 'lead' \| 'body' \| 'small' \| 'caption' \| 'eyebrow'`             | `'body'`    | `.app-text--<variant>` (mida + pes per defecte, veg. `styles.md`)                                       |
| `tone`     | `'default' \| 'muted' \| Tone`                                                                           | `'default'` | `.app-text--tone-<tone>` (`default` hereta el color, `muted` = `text-text-muted`, tons = `text-<tone>`) |
| `weight`   | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                                           | —           | `.app-text--<weight>` (sobreescriu el pes de la variant)                                                |
| `align`    | `'start' \| 'center' \| 'end'`                                                                           | —           | `.app-text--align-<align>`                                                                              |
| `truncate` | `boolean`                                                                                                | `false`     | `.app-text--truncate` (una línia amb el·lipsi)                                                          |

- **Variants/classes**: `.app-text` + les anteriors. Mai s'hi afegeix mida/pes/color des d'un altre CSS.
- **Slots**: `default`.
- **Events**: cap.
- **Exemple**:

```vue
<AppText as="h1" variant="display">{{ profile.name }}</AppText>
<AppText
  as="p"
  variant="eyebrow"
  tone="primary"
><AppIcon name="user" size="sm" />{{ t('about.eyebrow') }}</AppText>
<AppText as="time" variant="small" tone="muted" :datetime="item.start">{{ period }}</AppText>
<AppText v-for="(b, i) in bullets" :key="i" as="li" variant="small" tone="muted">{{ b }}</AppText>
```

- **Consumidors**: tots els components amb text (AppAlert, AppBadge, AppInput, AppSection, HeroSection,
  AboutSection, ExperienceItem, TechStack, EducationSection, ContactSection, AppFooter, SourceBanner, MemeCard,
  MemePreview, `pages/meme.vue`).

### AppLink

- **Ruta**: `app/components/shared/AppLink.vue`
- **Propòsit**: únic embolcall d'enllaços de text/icona: `to` → `NuxtLinkLocale` (o `NuxtLink` si
  `localize=false`), `href` → `<a>` (extern `https?://` → `target=_blank rel=noopener noreferrer`; àncora `#id`;
  `mailto:`). Els atributs (`class`, `aria-*`, `title`, `lang`, `tabindex`, `data-testid`) cauen a l'element.
- **Props**:

| Prop          | Tipus                                     | Default              | Valors permesos → classe                                                                                                                   |
| ------------- | ----------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `to`          | `string`                                  | `''`                 | ruta interna                                                                                                                               |
| `href`        | `string`                                  | `''`                 | URL externa, àncora o `mailto:`                                                                                                            |
| `variant`     | `'inline' \| 'nav' \| 'subtle' \| 'icon'` | `'inline'`           | `.app-link--inline` (subratllat a hover), `--nav` (pill amb estat actiu), `--subtle` (només color a hover), `--icon` (caixa 36px centrada) |
| `tone`        | `'default' \| Tone`                       | `'default'`          | `.app-link--tone-<tone>` (`default` hereta el color)                                                                                       |
| `activeClass` | `string`                                  | `'app-link--active'` | classe d'actiu del router (només amb `to`); `.app-link--nav.app-link--active`                                                              |
| `download`    | `boolean \| string`                       | —                    | passa a `<a download>`                                                                                                                     |
| `localize`    | `boolean`                                 | `true`               | `false` → `NuxtLink` sense prefix de locale (rutes ja localitzades)                                                                        |

- **Variants/classes**: `.app-link`, `--inline/--nav/--subtle/--icon`, `--tone-*`, `--active`.
- **Slots**: `default`.
- **Events**: cap de propi (`@click` cau a l'element).
- **Exemple**:

```vue
<AppLink to="/meme" variant="nav">{{ t('nav.meme') }}</AppLink>
<AppLink :href="profile.repo" variant="inline">{{ t('footer.source') }}</AppLink>
<AppLink
  :href="profile.github"
  variant="icon"
  :aria-label="t('contact.github')"
><AppIcon name="github" set="brands" /></AppLink>
<AppLink :to="switchLocalePath('ca')" :localize="false" variant="subtle">ca</AppLink>
```

- **Consumidors**: AppHeader (marca + nav), AppFooter, LocaleSwitcher, ExperienceItem (org), SourceBanner,
  `layouts/default.vue` (skip link).

### AppImage

- **Ruta**: `app/components/shared/AppImage.vue`
- **Propòsit**: únic embolcall d'`<img>` (decisió 018: sense `@nuxt/image`). `inheritAttrs: false` + `v-bind="$attrs"`
  sobre l'`<img>`: `class`, `fetchpriority`, `data-testid`… arriben a la imatge.
- **Props**:

| Prop      | Tipus                                      | Default   | Valors permesos → classe                                                    |
| --------- | ------------------------------------------ | --------- | --------------------------------------------------------------------------- |
| `src`     | `string` (requerida)                       | —         |                                                                             |
| `alt`     | `string` (requerida)                       | —         | text traduït o títol del meme                                               |
| `width`   | `number \| string`                         | —         |                                                                             |
| `height`  | `number \| string`                         | —         |                                                                             |
| `loading` | `'lazy' \| 'eager'`                        | `'lazy'`  |                                                                             |
| `fit`     | `'cover' \| 'contain'`                     | `'cover'` | `.app-image--fit-cover` / `--fit-contain`                                   |
| `radius`  | `'none' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'none'`  | `.app-image--radius-none/-md/-lg/-xl/-full` (`rounded-none/md/lg/3xl/full`) |
| `frame`   | `boolean`                                  | `false`   | `.app-image--frame` (vora `border` + `shadow-lg`)                           |

- **Variants/classes**: `.app-image` (`block max-w-full`) + les anteriors.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<AppImage
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

- **Consumidors**: HeroSection, MemeCard, MemePreview.

### AppInput

- **Ruta**: `app/components/shared/AppInput.vue`
- **Propòsit**: únic embolcall de formularis, només elements natius. `type` decideix el control; `v-model`
  genèric (`T extends string | number | boolean | Array<string|number> | null`), tipat pel consumidor.
- **Props**:

| Prop               | Tipus                                                                                                           | Default     | Valors permesos → classe                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `id`               | `string` (requerida)                                                                                            | —           | id del control (i `for` del label); per a `radio`, prefix `<id>-<value>`        |
| `label`            | `string` (requerida)                                                                                            | —           | label (`AppText small medium`); `legend` a `radio`                              |
| `type`             | `'text' \| 'search' \| 'email' \| 'number' \| 'textarea' \| 'select' \| 'multiselect' \| 'radio' \| 'checkbox'` | `'text'`    | `.app-input--<type>`                                                            |
| `options`          | `{ value: string \| number; label: string; disabled?: boolean }[]`                                              | `[]`        | `select`, `multiselect`, `radio`                                                |
| `placeholder`      | `string`                                                                                                        | `''`        | text/textarea/number; a `select` és una opció buida desactivada                 |
| `icon`             | `string`                                                                                                        | `''`        | només `text/search/email` → `.app-input--with-icon` (padding esquerre)          |
| `size`             | `Size`                                                                                                          | `'md'`      | `.app-input--sm/--md/--lg` (alçada 32/40/48)                                    |
| `tone`             | `'neutral' \| 'danger'`                                                                                         | `'neutral'` | `.app-input--danger` → vora vermella + `aria-invalid="true"` + hint en `danger` |
| `hint`             | `string`                                                                                                        | `''`        | `AppText caption` amb `id="<id>-hint"` → `aria-describedby`                     |
| `hideLabel`        | `boolean`                                                                                                       | `false`     | label `sr-only`                                                                 |
| `disabled`         | `boolean`                                                                                                       | `false`     | `.app-input--disabled` + `disabled` al control                                  |
| `required`         | `boolean`                                                                                                       | `false`     | `required` al control (`aria-required` al fieldset)                             |
| `rows`             | `number`                                                                                                        | `4`         | només `textarea`                                                                |
| `min`/`max`/`step` | `number`                                                                                                        | —           | només `number`                                                                  |
| `name`             | `string`                                                                                                        | `id`        | nom del grup `radio`                                                            |

- **Model**: `defineModel<T>()`. `number` emet `number` (o `null` si es buida); `select` emet el `value` tipat de
  l'opció; `multiselect` un array; `checkbox` un `boolean`; `radio` el `value` de l'opció triada.
- **Variants/classes**: `.app-input`, `--<type>`, `--sm/--md/--lg`, `--neutral/--danger`, `--with-icon`,
  `--disabled`; elements `__label`, `__field`, `__icon`, `__control` (input/select/textarea), `__group`
  (fieldset), `__options`, `__option`, `__radio`, `__checkbox`, `__hint`.
- **Slots**: cap.
- **Events**: `update:modelValue`.
- **Exemple**:

```vue
<AppInput
  id="meme-query"
  v-model="query"
  :label="t('meme.search.label')"
  icon="magnifying-glass"
  type="search"
  hide-label
/>
<AppInput
  id="fw"
  v-model="framework"
  type="select"
  :label="t('x.fw')"
  :options="[{ value: 'vue', label: 'Vue' }]"
/>
<AppInput id="ok" v-model="agree" type="checkbox" :label="t('x.agree')" />
<AppInput
  id="lvl"
  v-model="level"
  type="radio"
  :label="t('x.level')"
  :options="levels"
  tone="danger"
  :hint="t('x.required')"
/>
```

- **Consumidors**: MemeSearch. Test: `tests/unit/components/AppInput.spec.ts`.

### AppButton

- **Ruta**: `app/components/shared/AppButton.vue`
- **Propòsit**: botó/enllaç polimòrfic: `<button>` per defecte, `<a>` amb `href`, `NuxtLinkLocale` amb `to`. És
  l'únic lloc amb `<button>`/`<a>` de botó (els enllaços de text van per `AppLink`).
- **Props**:

| Prop       | Tipus                             | Default     | Valors permesos → classe                                                               |
| ---------- | --------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `tone`     | `Tone`                            | `'primary'` | `.app-button--<tone>` (combinat amb la variant)                                        |
| `size`     | `Size`                            | `'md'`      | `.app-button--sm/--md/--lg` (alçada 32/40/48)                                          |
| `variant`  | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | `.app-button--solid/--outline/--ghost`                                                 |
| `icon`     | `string`                          | `''`        | `AppIcon` davant del slot (`.app-button__icon`)                                        |
| `iconSet`  | `'solid' \| 'brands'`             | `'solid'`   |                                                                                        |
| `to`       | `string`                          | `''`        | ruta interna → `NuxtLinkLocale`                                                        |
| `href`     | `string`                          | `''`        | URL externa (`https?://` → `target=_blank` + `rel=noopener noreferrer`) o àncora `#id` |
| `type`     | `'button' \| 'submit'`            | `'button'`  | només quan renderitza `<button>`                                                       |
| `loading`  | `boolean`                         | `false`     | `.app-button--loading` + `aria-busy="true"` + desactivat                               |
| `disabled` | `boolean`                         | `false`     | `disabled` (button) o `aria-disabled` (enllaços)                                       |
| `block`    | `boolean`                         | `false`     | `.app-button--block` (amplada completa)                                                |

- **Variants/classes**: `.app-button`, mides, variants × tons (`.app-button--solid.app-button--primary`…), estats `--loading`, `--block`; element `__icon`. El text del botó (`text-sm font-medium`) és propi del primitiu.
- **Slots**: `default` (etiqueta; opcional per a botons només-icona amb `aria-label`).
- **Events**: cap de propi; atributs/listeners (`@click`, `data-testid`, `download`, `aria-pressed`) cauen a l'arrel.
- **Exemple**:

```vue
<AppButton
  tone="danger"
  variant="outline"
  icon="xmark"
  @click="remove"
>{{ t('x.remove') }}</AppButton>
<AppButton href="https://github.com/…" icon="github" icon-set="brands">GitHub</AppButton>
<AppButton to="/meme" size="sm" variant="ghost">{{ t('hero.tryMeme') }}</AppButton>
<AppButton
  variant="ghost"
  tone="neutral"
  icon="moon"
  :aria-label="t('theme.toggle')"
  class="theme-toggle"
/>
```

- **Consumidors**: `pages/meme.vue`, ContactSection, CvDownload, HeroSection, MemePreview, MemeSearch, MemeCard
  (targeta = botó), ThemeToggle.

### AppIcon

- **Ruta**: `app/components/shared/AppIcon.vue`
- **Propòsit**: únic embolcall de Font Awesome; la resta del codi té prohibit importar `@fortawesome/vue-fontawesome`.
- **Props**:

| Prop    | Tipus                 | Default   | Valors permesos → classe                                    |
| ------- | --------------------- | --------- | ----------------------------------------------------------- |
| `name`  | `string` (requerida)  | —         | nom sense prefix registrat a `plugins/fontawesome.ts`       |
| `set`   | `'solid' \| 'brands'` | `'solid'` |                                                             |
| `size`  | `Size`                | `'md'`    | `.app-icon--sm/--md/--lg` (`text-sm/base/2xl`)              |
| `label` | `string`              | `''`      | si es passa → `aria-label` + `title`; si no → `aria-hidden` |

- **Variants/classes**: `.app-icon`, `--sm/--md/--lg`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<AppIcon name="github" set="brands" size="sm" />
<AppIcon name="envelope" :label="t('contact.email')" />
```

- **Consumidors**: AppAlert, AppBadge, AppButton, AppInput, AppSection, AppFooter, EducationSection, HeroSection,
  TechStack, SourceBanner.

### AppBadge

- **Ruta**: `app/components/shared/AppBadge.vue`
- **Propòsit**: etiqueta inline (tags, idiomes, "open to work"). És un `AppText as="span"` (`caption` per `sm`,
  `small` per `md`/`lg`, `weight="medium"`) amb fons i forma pròpies.
- **Props**:

| Prop      | Tipus               | Default     | Valors permesos → classe                                              |
| --------- | ------------------- | ----------- | --------------------------------------------------------------------- |
| `tone`    | `Tone`              | `'neutral'` | `.app-badge--<tone>` (combinat amb la variant)                        |
| `variant` | `'soft' \| 'solid'` | `'soft'`    | `.app-badge--soft` (fons `-soft`, text del to) / `--solid` (fons ple) |
| `size`    | `Size`              | `'sm'`      | `.app-badge--sm/--md/--lg` (padding) + variant d'`AppText`            |
| `icon`    | `string`            | `''`        | icona davant del text                                                 |

- **Variants/classes**: `.app-badge`, `--sm/--md/--lg`, `--soft`/`--solid` × tons.
- **Slots**: `default`.
- **Events**: cap.
- **Exemple**:

```vue
<AppBadge tone="success" icon="circle-check">{{ t('hero.openToWork') }}</AppBadge>
<AppBadge size="md">Vue 3</AppBadge>
```

- **Consumidors**: AboutSection, ExperienceItem, HeroSection, TechStack.

### AppAlert

- **Ruta**: `app/components/shared/AppAlert.vue`
- **Propòsit**: missatge d'estat amb icona; `role="alert"` per a `danger`/`warning`, `role="status"` per a la resta.
  El títol és `AppText small semibold`; el contingut del slot és `text-sm` (propi del primitiu).
- **Props**:

| Prop    | Tipus    | Default  | Valors permesos → classe                                         |
| ------- | -------- | -------- | ---------------------------------------------------------------- |
| `tone`  | `Tone`   | `'info'` | `.app-alert--<tone>` (vora + fons `-soft`, icona i títol del to) |
| `title` | `string` | `''`     | `.app-alert__title`                                              |
| `icon`  | `string` | `''`     | sobreescriu la icona per defecte del to                          |

Icones per defecte: `circle-info` (primary/secondary/neutral/info), `circle-check` (success), `triangle-exclamation` (warning), `circle-xmark` (danger).

- **Variants/classes**: `.app-alert`, `--primary … --danger`; elements `__icon`, `__body`, `__title`, `__content`.
- **Slots**: `default` (contingut, admet `AppText` i botons en línia).
- **Events**: cap.
- **Exemple**:

```vue
<AppAlert tone="danger" :title="t('meme.results.errorTitle')">{{ t(errorKey) }}</AppAlert>
```

- **Consumidors**: `pages/meme.vue`, MemeGrid.

### AppCard

- **Ruta**: `app/components/shared/AppCard.vue`
- **Propòsit**: contenidor amb vora/fons/ombra i padding configurables; etiqueta arrel configurable.
- **Props**:

| Prop      | Tipus                                 | Default     | Valors permesos → classe                            |
| --------- | ------------------------------------- | ----------- | --------------------------------------------------- |
| `as`      | `string`                              | `'div'`     | etiqueta estructural (`div`, `section`, `article`…) |
| `variant` | `'outline' \| 'filled' \| 'elevated'` | `'outline'` | `.app-card--outline/--filled/--elevated`            |
| `padding` | `Size`                                | `'md'`      | `.app-card--padding-sm/-md/-lg` (`p-3/p-5/p-8`)     |

- **Variants/classes**: `.app-card` (`rounded-xl`), variants, paddings; elements `__header`, `__footer`.
- **Slots**: `default`, `header` (opcional), `footer` (opcional).
- **Events**: cap.
- **Exemple**:

```vue
<AppCard variant="filled" padding="md">
  <template #header><AppText as="h2" variant="body" weight="semibold">…</AppText></template>
  …
</AppCard>
```

- **Consumidors**: `pages/meme.vue`, MemePreview.

### AppSection

- **Ruta**: `app/components/shared/AppSection.vue`
- **Propòsit**: secció del CV amb `id` (àncora), eyebrow (`AppText eyebrow primary` + icona), títol
  (`AppText h2`) i subtítol (`AppText body muted`); `aria-labelledby` automàtic. Les seccions `cv/*` en llegeixen
  el títol/eyebrow/icona de `ui-config/cv/sections.ts`.
- **Props**:

| Prop       | Tipus                | Default | Valors permesos → classe                      |
| ---------- | -------------------- | ------- | --------------------------------------------- |
| `id`       | `string` (requerida) | —       | id de secció (`about`, `stack`…)              |
| `title`    | `string` (requerida) | —       | `.app-section__title` (`h2`, id `<id>-title`) |
| `eyebrow`  | `string`             | `''`    | `.app-section__eyebrow`                       |
| `icon`     | `string`             | `''`    | només es mostra si hi ha eyebrow              |
| `subtitle` | `string`             | `''`    | `.app-section__subtitle`                      |

- **Variants/classes**: `.app-section` (padding vertical + `scroll-mt`); elements `__header`, `__eyebrow`, `__title`, `__subtitle`.
- **Slots**: `default`.
- **Events**: cap.
- **Exemple**:

```vue
<AppSection
  :id="config.id"
  :title="t(config.titleKey)"
  :eyebrow="t(config.eyebrowKey)"
  :icon="config.icon"
  class="tech-stack"
>…</AppSection>
```

- **Consumidors**: AboutSection, ContactSection, EducationSection, ExperienceSection, TechStack.

### AppSkeleton

- **Ruta**: `app/components/shared/AppSkeleton.vue`
- **Propòsit**: placeholder animat mentre carrega (`aria-hidden`).
- **Props**:

| Prop    | Tipus                           | Default  | Valors permesos → classe                                       |
| ------- | ------------------------------- | -------- | -------------------------------------------------------------- |
| `shape` | `'text' \| 'image' \| 'circle'` | `'text'` | `.app-skeleton--text` (línia), `--image` (quadrat), `--circle` |

- **Variants/classes**: `.app-skeleton`, `--text`, `--image`, `--circle`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<AppSkeleton v-for="n in 8" :key="n" shape="image" />
```

- **Consumidors**: MemeGrid.

### AppMarquee

- **Ruta**: `app/components/shared/AppMarquee.vue`
- **Propòsit**: banner horitzontal infinit. Renderitza el slot dues vegades dins d'una pista que es desplaça
  `translateX(-50%)` en bucle (`@keyframes app-marquee-scroll`). La segona còpia és `aria-hidden="true"` + `inert`;
  el slot rep `duplicate` perquè els enllaços de la còpia posin `tabindex="-1"`. Amb `prefers-reduced-motion:
reduce` no hi ha animació i només es veu la primera còpia. Contenidor `div` amb `aria-label` (no `role`).
- **Props**:

| Prop           | Tipus                          | Default     | Valors permesos → classe                                      |
| -------------- | ------------------------------ | ----------- | ------------------------------------------------------------- |
| `label`        | `string` (requerida)           | —           | `aria-label` (i18n)                                           |
| `speed`        | `'slow' \| 'normal' \| 'fast'` | `'normal'`  | `.app-marquee--slow/--normal/--fast` (durada 70s / 40s / 20s) |
| `pauseOnHover` | `boolean`                      | `true`      | `.app-marquee--pause` (pausa a `:hover` i `:focus-within`)    |
| `tone`         | `Tone`                         | `'primary'` | `.app-marquee--<tone>` (fons `-soft` + text del to)           |
| `size`         | `Size`                         | `'md'`      | `.app-marquee--sm/--md/--lg` (padding vertical de la còpia)   |

- **Variants/classes**: `.app-marquee`, `__track`, `__copy` + modificadors anteriors.
- **Slots**: `default` amb prop `{ duplicate: boolean }`.
- **Events**: cap.
- **Exemple**:

```vue
<AppMarquee :label="t('banner.label')" speed="normal" tone="primary" size="sm">
  <template #default="{ duplicate }">
    <AppText as="span" variant="small">… <AppLink :href="repo" :tabindex="duplicate ? -1 : undefined">…</AppLink></AppText>
  </template>
</AppMarquee>
```

- **Consumidors**: SourceBanner. Test: `tests/unit/components/AppMarquee.spec.ts`.

---

## Layout (`app/components/layout/`)

### AppHeader

- **Ruta**: `app/components/layout/AppHeader.vue`
- **Propòsit**: capçalera fixa amb marca (`AppLink subtle neutral`), navegació (`/`, `/meme`) amb `AppLink nav`
  (estat actiu `.app-link--active`) i eines (idioma, tema).
- **Props**: cap.
- **Variants/classes**: `.app-header`; elements `__inner`, `__brand` (`font-bold`), `__nav`, `__link`, `__tools`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<AppHeader />
```

- **Consumidors**: `layouts/default.vue`.

### SourceBanner

- **Ruta**: `app/components/layout/SourceBanner.vue`
- **Propòsit**: marquesina (`AppMarquee` `primary`/`sm`) que anuncia que el codi és públic: 4 còpies de
  `AppIcon code` + `banner.source` + `AppLink` a `profile.repo` (`banner.repo`). `data-testid="source-banner"`.
  Va a `layouts/default.vue` entre `AppHeader` i `main`.
- **Props**: cap.
- **Variants/classes**: `.source-banner` (vora inferior); elements `__item`, `__icon`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<SourceBanner />
```

- **Consumidors**: `layouts/default.vue`. E2E: "home renders CV sections".

### AppFooter

- **Ruta**: `app/components/layout/AppFooter.vue`
- **Propòsit**: peu amb crèdit (`AppText small muted`), enllaç al codi font (`AppLink inline`) i icones de contacte
  (`AppLink icon`: GitHub, LinkedIn, correu) de `data/cv`.
- **Props**: cap.
- **Variants/classes**: `.app-footer`; elements `__inner`, `__source`, `__links`, `__link`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<AppFooter />
```

- **Consumidors**: `layouts/default.vue`.

### ThemeToggle

- **Ruta**: `app/components/layout/ThemeToggle.vue`
- **Propòsit**: `AppButton ghost neutral` només-icona (`sun`/`moon`) sobre `useColorMode()` (`ClientOnly`, fallback
  `div` buit per evitar mismatch d'hidratació). `data-testid="theme-toggle"`, `aria-pressed` quan és fosc.
- **Props**: cap.
- **Variants/classes**: `.theme-toggle` (caixa 40×40 sense padding, sobre `.app-button`).
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<ThemeToggle />
```

- **Consumidors**: AppHeader.

### LocaleSwitcher

- **Ruta**: `app/components/layout/LocaleSwitcher.vue`
- **Propòsit**: enllaços `en / ca / es` (`AppLink subtle` amb `localize=false` sobre `useSwitchLocalePath()`);
  `aria-current` a l'actiu; `data-testid="locale-<code>"`.
- **Props**: cap.
- **Variants/classes**: `.locale-switcher`; elements `__item` (pill `text-xs uppercase`, propi de l'enllaç),
  `__item--active`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<LocaleSwitcher />
```

- **Consumidors**: AppHeader.

---

## CV (`app/components/cv/`)

### HeroSection

- **Ruta**: `app/components/cv/HeroSection.vue`
- **Propòsit**: capçalera del CV: salutació (`AppText lead muted`), nom (`AppText h1 display`), headline
  (`AppText h3 primary`), tagline (`body muted`), ubicació (`small muted` + icona), badge, CTA de contacte,
  descàrrega del CV i retrat (`AppImage radius=xl frame`, `data-testid="hero-image"`). El retrat es substitueix
  pel meme de `useHeroStore` (`hero.selected.full`) i el `figcaption` (`AppText small muted`) mostra el botó de
  reset (`data-testid="hero-reset"`).
- **Props**: cap.
- **Variants/classes**: `.hero-section`; elements `__content`, `__greeting`, `__name`, `__headline`, `__tagline`, `__meta`, `__meta-item`, `__actions`, `__figure`, `__image` (`aspect-square`), `__image--meme` (vora `primary`), `__caption`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<HeroSection />
```

- **Consumidors**: `pages/index.vue`.

### AboutSection

- **Ruta**: `app/components/cv/AboutSection.vue`
- **Propòsit**: secció `#about` (config `getSectionConfig('about')`): dos paràgrafs (`AppText body muted`), idiomes
  i interessos (títols `AppText h3 eyebrow muted` + badges) de `profile`.
- **Props**: cap.
- **Variants/classes**: `.about-section` (arrel), `__grid`, `__text`, `__aside`, `__aside-title`, `__list`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<AboutSection />
```

- **Consumidors**: `pages/index.vue` (via `homeSections`).

### ExperienceSection

- **Ruta**: `app/components/cv/ExperienceSection.vue`
- **Propòsit**: secció `#experience`: llista `experience` de `data/cv` amb `ExperienceItem` en variant `detailed`.
- **Props**: cap.
- **Variants/classes**: `.experience-section` (arrel), `__list`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<ExperienceSection />
```

- **Consumidors**: `pages/index.vue` (via `homeSections`).

### ExperienceItem

- **Ruta**: `app/components/cv/ExperienceItem.vue`
- **Propòsit**: entrada de línia de temps (feina, formació o certificat). Text per i18n a `<section>.items.<id>`
  (`title`, `bullets[]` via `useMessageList`, `note`); període amb `formatPeriod` (`~/domain/cv/period`) i el
  locale actiu. Tipografia: període `AppText small muted` (+ `time`), títol `h3 body semibold`, org `body muted`
  (`AppLink inline` si té URL), ubicació `span small muted`, bullets `li small muted`, nota `small muted`.
- **Props**:

| Prop      | Tipus                      | Default      | Valors permesos → classe                                                 |
| --------- | -------------------------- | ------------ | ------------------------------------------------------------------------ |
| `item`    | `TimelineItem` (requerida) | —            | `app/domain/cv/types.ts`                                                 |
| `variant` | `'detailed' \| 'compact'`  | `'detailed'` | `.experience-item--detailed` (bullets) / `--compact` (nota, punt neutre) |

- **Variants/classes**: `.experience-item`, `--detailed`, `--compact`; elements `__period`, `__body`, `__title`, `__org`, `__org-link`, `__bullets`, `__note`, `__tags`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<ExperienceItem :item="item" variant="compact" />
```

- **Consumidors**: ExperienceSection, EducationSection.

### TechStack

- **Ruta**: `app/components/cv/TechStack.vue`
- **Propòsit**: secció `#stack`: grups de `stack` (`data/cv`) amb títol (`AppText h3 body semibold` + icona) i badges.
- **Props**: cap.
- **Variants/classes**: `.tech-stack` (arrel), `__groups`, `__group`, `__group-title`, `__list`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<TechStack />
```

- **Consumidors**: `pages/index.vue` (via `homeSections`).

### EducationSection

- **Ruta**: `app/components/cv/EducationSection.vue`
- **Propòsit**: secció `#education`: formació i, sota un subtítol (`AppText h3 lead semibold` + icona
  `certificate`), certificacions; tot amb `ExperienceItem` `compact`.
- **Props**: cap.
- **Variants/classes**: `.education-section` (arrel), `__list`, `__subtitle`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<EducationSection />
```

- **Consumidors**: `pages/index.vue` (via `homeSections`).

### ContactSection

- **Ruta**: `app/components/cv/ContactSection.vue`
- **Propòsit**: secció `#contact`: intro (`AppText body muted`) i botons de correu, LinkedIn, GitHub i descàrrega del CV.
- **Props**: cap.
- **Variants/classes**: `.contact-section` (arrel), `__intro`, `__actions`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<ContactSection />
```

- **Consumidors**: `pages/index.vue` (via `homeSections`).

### CvDownload

- **Ruta**: `app/components/cv/CvDownload.vue`
- **Propòsit**: botó de descàrrega del PDF del CV per idioma (`/cv/cv-<locale>.pdf`, atribut `download`). Regla 04: el PDF no porta telèfon ni adreça.
- **Props**:

| Prop      | Tipus                             | Default     | Valors permesos → classe |
| --------- | --------------------------------- | ----------- | ------------------------ |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | passa a `AppButton`      |
| `tone`    | `Tone`                            | `'primary'` | passa a `AppButton`      |
| `size`    | `Size`                            | `'md'`      | passa a `AppButton`      |

- **Variants/classes**: `.cv-download` (`div` inline-flex; l'estil visual és el d'`AppButton`).
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<CvDownload variant="outline" />
<CvDownload variant="ghost" tone="neutral" />
```

- **Consumidors**: HeroSection, ContactSection.

---

## Meme (`app/components/meme/`)

### MemeSearch

- **Ruta**: `app/components/meme/MemeSearch.vue`
- **Propòsit**: formulari `role="search"` amb `AppInput type=search` (`id="meme-query"`) i botó de cerca
  (`data-testid="meme-search-submit"`, desactivat si la query és buida). Emet la query retallada en fer submit.
- **Props**:

| Prop      | Tipus     | Default | Valors permesos                 |
| --------- | --------- | ------- | ------------------------------- |
| `loading` | `boolean` | `false` | passa a `AppButton` (`loading`) |
| `initial` | `string`  | `''`    | valor inicial del camp          |

- **Variants/classes**: `.meme-search`, `__input`.
- **Slots**: cap.
- **Events**: `search: [query: string]`.
- **Exemple**:

```vue
<MemeSearch :loading="giphy.status === 'pending'" :initial="giphy.query" @search="onSearch" />
```

- **Consumidors**: `pages/meme.vue`.

### MemeGrid

- **Ruta**: `app/components/meme/MemeGrid.vue`
- **Propòsit**: graella de resultats segons `status` (`pending` → skeletons `data-testid="meme-skeletons"`;
  `error` → `AppAlert danger` amb `t(errorKey)`; `success` sense resultats → `AppAlert info`; altrament llista de
  `MemeCard`). `aria-live="polite"`.
- **Props**:

| Prop         | Tipus                                | Default                | Valors permesos                                      |
| ------------ | ------------------------------------ | ---------------------- | ---------------------------------------------------- |
| `items`      | `Meme[]` (requerida)                 | —                      | `#shared/types/giphy`                                |
| `status`     | `AsyncDataRequestStatus` (requerida) | —                      | `idle`, `pending`, `success`, `error`                |
| `selectedId` | `string \| null`                     | `null`                 | id del meme marcat com a seleccionat                 |
| `skeletons`  | `number`                             | `8`                    | nombre de placeholders                               |
| `errorKey`   | `string`                             | `'meme.results.error'` | clau i18n del missatge (de `useGiphyStore.errorKey`) |

- **Variants/classes**: `.meme-grid`, `__skeletons`, `__list`, `__state`.
- **Slots**: cap.
- **Events**: `select: [meme: Meme]` (reemès des de `MemeCard`).
- **Exemple**:

```vue
<MemeGrid
  :items="giphy.items"
  :status="giphy.status"
  :error-key="giphy.errorKey"
  :selected-id="candidate?.id ?? null"
  @select="candidate = $event"
/>
```

- **Consumidors**: `pages/meme.vue`.

### MemeCard

- **Ruta**: `app/components/meme/MemeCard.vue`
- **Propòsit**: targeta-botó d'un GIF: `AppButton ghost neutral` amb `AppImage` (`preview`, lazy) i títol
  (`AppText span caption truncate`, visible a hover/focus/selected); `aria-pressed` i `aria-label` traduït;
  `data-testid="meme-card"`.
- **Props**:

| Prop       | Tipus              | Default | Valors permesos → classe                       |
| ---------- | ------------------ | ------- | ---------------------------------------------- |
| `meme`     | `Meme` (requerida) | —       | `#shared/types/giphy`                          |
| `selected` | `boolean`          | `false` | `.meme-card--selected` + `aria-pressed="true"` |

- **Variants/classes**: `.meme-card` (quadrat, sobre `.app-button`), `--selected`; elements `__image`, `__title`.
- **Slots**: cap.
- **Events**: `select: [meme: Meme]`.
- **Exemple**:

```vue
<MemeCard :meme="meme" :selected="meme.id === selectedId" @select="onSelect" />
```

- **Consumidors**: MemeGrid. Test: `tests/unit/components/MemeCard.spec.ts`.

### MemePreview

- **Ruta**: `app/components/meme/MemePreview.vue`
- **Propòsit**: previsualització a mida completa (`AppImage full radius=lg`) dins d'un `AppCard elevated`, amb títol
  (`AppText lead semibold`), mides (`small muted`) i botons "posar-me'l" (`data-testid="meme-use"`) / "triar-ne
  un altre". Contenidor `data-testid="meme-preview"`.
- **Props**:

| Prop   | Tipus              | Default | Valors permesos       |
| ------ | ------------------ | ------- | --------------------- |
| `meme` | `Meme` (requerida) | —       | `#shared/types/giphy` |

- **Variants/classes**: `.meme-preview`; elements `__image`, `__body`, `__title`, `__meta`, `__actions`.
- **Slots**: cap.
- **Events**: `use: [meme: Meme]`, `cancel: []`.
- **Exemple**:

```vue
<MemePreview v-if="candidate" :meme="candidate" @use="wear" @cancel="candidate = null" />
```

- **Consumidors**: `pages/meme.vue`.
