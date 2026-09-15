# Catàleg de components

Documentació viva (regla 07): cada component de `app/components/` té un bloc `### <Nom>` aquí. El test
`tests/arch/docs-sync.spec.ts` falla si se'n crea un sense bloc o si un bloc apunta a un component
esborrat. **Abans de crear un component nou, busca'n un aquí que ja ho faci** (decisió 027).

Convencions comunes:

- Primitius a `app/components/shared/Custom*` (decisions 026, 038): tot element natiu de text, formulari, enllaç o
  imatge passa pel seu primitiu. ESLint (`vue/no-restricted-html-elements`) prohibeix a `app/**`
  `p, span, h1-h6, small, strong, em, label` (→ `CustomText`), `input, select, textarea` (→ `CustomInput`),
  `button` (→ `CustomButton`), `a` (→ `CustomLink`), `img` (→ `CustomImage`). Els estructurals (`div`, `section`,
  `header`, `footer`, `nav`, `ul`, `ol`, `li`, `figure`, `form`, `fieldset`, `legend`, `article`) són natius.
- La **tipografia** (mida, pes, color de text) només la posa `CustomText` (`custom-text.css`). Els CSS de la resta de
  components només tenen layout/espai/fons/vores.
- Cada component té un únic bloc CSS (BEM) a `app/assets/css/components/<kebab>.css`, importat des de
  `main.css`. Al template només s'usen classes d'aquest bloc (regla 08, `tests/arch/css-per-component.spec.ts`).
- Cap string d'usuari al template: tot passa per `useI18n()` (regla 05).
- `Tone` = `primary | secondary | neutral | success | info | warning | danger`; `Size` = `sm | md | lg`
  (`app/types/ui.ts`).
- Les icones passen sempre per `CustomIcon` i han d'estar registrades a `app/plugins/fontawesome.ts`.
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

### CustomText

- **Ruta**: `app/components/shared/CustomText.vue`
- **Propòsit**: únic propietari de la tipografia. Renderitza l'etiqueta `as` amb l'escala de `custom-text.css`.
  Tots els atributs (`id`, `datetime`, `for`, `aria-*`, `data-testid`, `class`) cauen a l'element.
- **Props**:

| Prop       | Tipus                                                                                                    | Default     | Valors permesos → classe                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `as`       | `'p' \| 'span' \| 'h1'…'h6' \| 'small' \| 'strong' \| 'em' \| 'label' \| 'figcaption' \| 'time' \| 'li'` | `'p'`       | etiqueta HTML renderitzada (no afecta l'estil)                                                             |
| `variant`  | `'display' \| 'h1' \| 'h2' \| 'h3' \| 'lead' \| 'body' \| 'small' \| 'caption' \| 'eyebrow'`             | `'body'`    | `.custom-text--<variant>` (mida + pes per defecte, veg. `styles.md`)                                       |
| `tone`     | `'default' \| 'muted' \| Tone`                                                                           | `'default'` | `.custom-text--tone-<tone>` (`default` hereta el color, `muted` = `text-text-muted`, tons = `text-<tone>`) |
| `weight`   | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                                           | —           | `.custom-text--<weight>` (sobreescriu el pes de la variant)                                                |
| `align`    | `'start' \| 'center' \| 'end'`                                                                           | —           | `.custom-text--align-<align>`                                                                              |
| `truncate` | `boolean`                                                                                                | `false`     | `.custom-text--truncate` (una línia amb el·lipsi)                                                          |

- **Variants/classes**: `.custom-text` + les anteriors. Mai s'hi afegeix mida/pes/color des d'un altre CSS.
- **Slots**: `default`.
- **Events**: cap.
- **Exemple**:

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

- **Consumidors**: tots els components amb text (CustomAlert, CustomBadge, CustomInput, CustomSection, HeroSection,
  AboutSection, ExperienceItem, TechStack, EducationSection, ContactSection, AppFooter, SourceBanner, MemeCard,
  MemePreview, `pages/meme.vue`).

### CustomLink

- **Ruta**: `app/components/shared/CustomLink.vue`
- **Propòsit**: únic embolcall d'enllaços de text/icona: `to` → `NuxtLinkLocale` (o `NuxtLink` si
  `localize=false`), `href` → `<a>` (extern `https?://` → `target=_blank rel=noopener noreferrer`; àncora `#id`;
  `mailto:`). Els atributs (`class`, `aria-*`, `title`, `lang`, `tabindex`, `data-testid`) cauen a l'element.
- **Props**:

| Prop          | Tipus                                     | Default                 | Valors permesos → classe                                                                                                                      |
| ------------- | ----------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `to`          | `string`                                  | `''`                    | ruta interna                                                                                                                                  |
| `href`        | `string`                                  | `''`                    | URL externa, àncora o `mailto:`                                                                                                               |
| `variant`     | `'inline' \| 'nav' \| 'subtle' \| 'icon'` | `'inline'`              | `.custom-link--inline` (subratllat a hover), `--nav` (pill amb estat actiu), `--subtle` (només color a hover), `--icon` (caixa 36px centrada) |
| `tone`        | `'default' \| Tone`                       | `'default'`             | `.custom-link--tone-<tone>` (`default` hereta el color)                                                                                       |
| `activeClass` | `string`                                  | `'custom-link--active'` | classe d'actiu del router (només amb `to`); `.custom-link--nav.custom-link--active`                                                           |
| `download`    | `boolean \| string`                       | —                       | passa a `<a download>`                                                                                                                        |
| `localize`    | `boolean`                                 | `true`                  | `false` → `NuxtLink` sense prefix de locale (rutes ja localitzades)                                                                           |

- **Variants/classes**: `.custom-link`, `--inline/--nav/--subtle/--icon`, `--tone-*`, `--active`.
- **Slots**: `default`.
- **Events**: cap de propi (`@click` cau a l'element).
- **Exemple**:

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

- **Consumidors**: AppHeader (marca + nav), AppFooter, LocaleSwitcher, ExperienceItem (org), SourceBanner,
  `layouts/default.vue` (skip link).

### CustomImage

- **Ruta**: `app/components/shared/CustomImage.vue`
- **Propòsit**: únic embolcall d'`<img>` (decisió 018: sense `@nuxt/image`). `inheritAttrs: false` + `v-bind="$attrs"`
  sobre l'`<img>`: `class`, `fetchpriority`, `data-testid`… arriben a la imatge.
- **Props**:

| Prop      | Tipus                                      | Default   | Valors permesos → classe                                                       |
| --------- | ------------------------------------------ | --------- | ------------------------------------------------------------------------------ |
| `src`     | `string` (requerida)                       | —         |                                                                                |
| `alt`     | `string` (requerida)                       | —         | text traduït o títol del meme                                                  |
| `width`   | `number \| string`                         | —         |                                                                                |
| `height`  | `number \| string`                         | —         |                                                                                |
| `loading` | `'lazy' \| 'eager'`                        | `'lazy'`  |                                                                                |
| `fit`     | `'cover' \| 'contain'`                     | `'cover'` | `.custom-image--fit-cover` / `--fit-contain`                                   |
| `radius`  | `'none' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'none'`  | `.custom-image--radius-none/-md/-lg/-xl/-full` (`rounded-none/md/lg/3xl/full`) |
| `frame`   | `boolean`                                  | `false`   | `.custom-image--frame` (vora `border` + `shadow-lg`)                           |

- **Variants/classes**: `.custom-image` (`block max-w-full`) + les anteriors.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

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

- **Consumidors**: HeroSection, MemeCard, MemePreview.

### CustomInput

- **Ruta**: `app/components/shared/CustomInput.vue`
- **Propòsit**: únic embolcall de formularis, només elements natius. `type` decideix el control; `v-model`
  genèric (`T extends string | number | boolean | Array<string|number> | null`), tipat pel consumidor.
- **Props**:

| Prop               | Tipus                                                                                                           | Default     | Valors permesos → classe                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `id`               | `string` (requerida)                                                                                            | —           | id del control (i `for` del label); per a `radio`, prefix `<id>-<value>`           |
| `label`            | `string` (requerida)                                                                                            | —           | label (`CustomText small medium`); `legend` a `radio`                              |
| `type`             | `'text' \| 'search' \| 'email' \| 'number' \| 'textarea' \| 'select' \| 'multiselect' \| 'radio' \| 'checkbox'` | `'text'`    | `.custom-input--<type>`                                                            |
| `options`          | `{ value: string \| number; label: string; disabled?: boolean }[]`                                              | `[]`        | `select`, `multiselect`, `radio`                                                   |
| `placeholder`      | `string`                                                                                                        | `''`        | text/textarea/number; a `select` és una opció buida desactivada                    |
| `icon`             | `string`                                                                                                        | `''`        | només `text/search/email` → `.custom-input--with-icon` (padding esquerre)          |
| `size`             | `Size`                                                                                                          | `'md'`      | `.custom-input--sm/--md/--lg` (alçada 32/40/48)                                    |
| `tone`             | `'neutral' \| 'danger'`                                                                                         | `'neutral'` | `.custom-input--danger` → vora vermella + `aria-invalid="true"` + hint en `danger` |
| `hint`             | `string`                                                                                                        | `''`        | `CustomText caption` amb `id="<id>-hint"` → `aria-describedby`                     |
| `hideLabel`        | `boolean`                                                                                                       | `false`     | label `sr-only`                                                                    |
| `disabled`         | `boolean`                                                                                                       | `false`     | `.custom-input--disabled` + `disabled` al control                                  |
| `required`         | `boolean`                                                                                                       | `false`     | `required` al control (`aria-required` al fieldset)                                |
| `rows`             | `number`                                                                                                        | `4`         | només `textarea`                                                                   |
| `min`/`max`/`step` | `number`                                                                                                        | —           | només `number`                                                                     |
| `name`             | `string`                                                                                                        | `id`        | nom del grup `radio`                                                               |

- **Model**: `defineModel<T>()`. `number` emet `number` (o `null` si es buida); `select` emet el `value` tipat de
  l'opció; `multiselect` un array; `checkbox` un `boolean`; `radio` el `value` de l'opció triada.
- **Variants/classes**: `.custom-input`, `--<type>`, `--sm/--md/--lg`, `--neutral/--danger`, `--with-icon`,
  `--disabled`; elements `__label`, `__field`, `__icon`, `__control` (input/select/textarea), `__group`
  (fieldset), `__options`, `__option`, `__radio`, `__checkbox`, `__hint`.
- **Slots**: cap.
- **Events**: `update:modelValue`.
- **Exemple**:

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

- **Consumidors**: MemeSearch. Test: `tests/unit/components/CustomInput.spec.ts`.

### CustomButton

- **Ruta**: `app/components/shared/CustomButton.vue`
- **Propòsit**: botó/enllaç polimòrfic: `<button>` per defecte, `<a>` amb `href`, `NuxtLinkLocale` amb `to`. És
  l'únic lloc amb `<button>`/`<a>` de botó (els enllaços de text van per `CustomLink`).
- **Props**:

| Prop       | Tipus                             | Default     | Valors permesos → classe                                                               |
| ---------- | --------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `tone`     | `Tone`                            | `'primary'` | `.custom-button--<tone>` (combinat amb la variant)                                     |
| `size`     | `Size`                            | `'md'`      | `.custom-button--sm/--md/--lg` (alçada 32/40/48)                                       |
| `variant`  | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | `.custom-button--solid/--outline/--ghost`                                              |
| `icon`     | `string`                          | `''`        | `CustomIcon` davant del slot (`.custom-button__icon`)                                  |
| `iconSet`  | `'solid' \| 'brands'`             | `'solid'`   |                                                                                        |
| `to`       | `string`                          | `''`        | ruta interna → `NuxtLinkLocale`                                                        |
| `href`     | `string`                          | `''`        | URL externa (`https?://` → `target=_blank` + `rel=noopener noreferrer`) o àncora `#id` |
| `type`     | `'button' \| 'submit'`            | `'button'`  | només quan renderitza `<button>`                                                       |
| `loading`  | `boolean`                         | `false`     | `.custom-button--loading` + `aria-busy="true"` + desactivat                            |
| `disabled` | `boolean`                         | `false`     | `disabled` (button) o `aria-disabled` (enllaços)                                       |
| `block`    | `boolean`                         | `false`     | `.custom-button--block` (amplada completa)                                             |

- **Variants/classes**: `.custom-button`, mides, variants × tons (`.custom-button--solid.custom-button--primary`…), estats `--loading`, `--block`; element `__icon`. El text del botó (`text-sm font-medium`) és propi del primitiu.
- **Slots**: `default` (etiqueta; opcional per a botons només-icona amb `aria-label`).
- **Events**: cap de propi; atributs/listeners (`@click`, `data-testid`, `download`, `aria-pressed`) cauen a l'arrel.
- **Exemple**:

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

- **Consumidors**: `pages/meme.vue`, ContactSection, CvDownload, HeroSection, MemePreview, MemeSearch, MemeCard
  (targeta = botó), ThemeToggle.

### CustomIcon

- **Ruta**: `app/components/shared/CustomIcon.vue`
- **Propòsit**: únic embolcall de Font Awesome; la resta del codi té prohibit importar `@fortawesome/vue-fontawesome`.
- **Props**:

| Prop    | Tipus                 | Default   | Valors permesos → classe                                    |
| ------- | --------------------- | --------- | ----------------------------------------------------------- |
| `name`  | `string` (requerida)  | —         | nom sense prefix registrat a `plugins/fontawesome.ts`       |
| `set`   | `'solid' \| 'brands'` | `'solid'` |                                                             |
| `size`  | `Size`                | `'md'`    | `.custom-icon--sm/--md/--lg` (`text-sm/base/2xl`)           |
| `label` | `string`              | `''`      | si es passa → `aria-label` + `title`; si no → `aria-hidden` |

- **Variants/classes**: `.custom-icon`, `--sm/--md/--lg`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<CustomIcon name="github" set="brands" size="sm" />
<CustomIcon name="envelope" :label="t('contact.email')" />
```

- **Consumidors**: CustomAlert, CustomBadge, CustomButton, CustomInput, CustomSection, AppFooter, EducationSection, HeroSection,
  TechStack, SourceBanner.

### CustomBadge

- **Ruta**: `app/components/shared/CustomBadge.vue`
- **Propòsit**: etiqueta inline (tags, idiomes, "open to work"). És un `CustomText as="span"` (`caption` per `sm`,
  `small` per `md`/`lg`, `weight="medium"`) amb fons i forma pròpies.
- **Props**:

| Prop      | Tipus               | Default     | Valors permesos → classe                                                 |
| --------- | ------------------- | ----------- | ------------------------------------------------------------------------ |
| `tone`    | `Tone`              | `'neutral'` | `.custom-badge--<tone>` (combinat amb la variant)                        |
| `variant` | `'soft' \| 'solid'` | `'soft'`    | `.custom-badge--soft` (fons `-soft`, text del to) / `--solid` (fons ple) |
| `size`    | `Size`              | `'sm'`      | `.custom-badge--sm/--md/--lg` (padding) + variant d'`CustomText`         |
| `icon`    | `string`            | `''`        | icona davant del text                                                    |

- **Variants/classes**: `.custom-badge`, `--sm/--md/--lg`, `--soft`/`--solid` × tons.
- **Slots**: `default`.
- **Events**: cap.
- **Exemple**:

```vue
<CustomBadge tone="success" icon="circle-check">{{ t('hero.openToWork') }}</CustomBadge>
<CustomBadge size="md">Vue 3</CustomBadge>
```

- **Consumidors**: AboutSection, ExperienceItem, HeroSection, TechStack.

### CustomAlert

- **Ruta**: `app/components/shared/CustomAlert.vue`
- **Propòsit**: missatge d'estat amb icona; `role="alert"` per a `danger`/`warning`, `role="status"` per a la resta.
  El títol és `CustomText small semibold`; el contingut del slot és `text-sm` (propi del primitiu).
- **Props**:

| Prop    | Tipus    | Default  | Valors permesos → classe                                            |
| ------- | -------- | -------- | ------------------------------------------------------------------- |
| `tone`  | `Tone`   | `'info'` | `.custom-alert--<tone>` (vora + fons `-soft`, icona i títol del to) |
| `title` | `string` | `''`     | `.custom-alert__title`                                              |
| `icon`  | `string` | `''`     | sobreescriu la icona per defecte del to                             |

Icones per defecte: `circle-info` (primary/secondary/neutral/info), `circle-check` (success), `triangle-exclamation` (warning), `circle-xmark` (danger).

- **Variants/classes**: `.custom-alert`, `--primary … --danger`; elements `__icon`, `__body`, `__title`, `__content`.
- **Slots**: `default` (contingut, admet `CustomText` i botons en línia).
- **Events**: cap.
- **Exemple**:

```vue
<CustomAlert tone="danger" :title="t('meme.results.errorTitle')">{{ t(errorKey) }}</CustomAlert>
```

- **Consumidors**: `pages/meme.vue`, MemeGrid.

### CustomCard

- **Ruta**: `app/components/shared/CustomCard.vue`
- **Propòsit**: contenidor amb vora/fons/ombra i padding configurables; etiqueta arrel configurable.
- **Props**:

| Prop      | Tipus                                 | Default     | Valors permesos → classe                            |
| --------- | ------------------------------------- | ----------- | --------------------------------------------------- |
| `as`      | `string`                              | `'div'`     | etiqueta estructural (`div`, `section`, `article`…) |
| `variant` | `'outline' \| 'filled' \| 'elevated'` | `'outline'` | `.custom-card--outline/--filled/--elevated`         |
| `padding` | `Size`                                | `'md'`      | `.custom-card--padding-sm/-md/-lg` (`p-3/p-5/p-8`)  |

- **Variants/classes**: `.custom-card` (`rounded-xl`), variants, paddings; elements `__header`, `__footer`.
- **Slots**: `default`, `header` (opcional), `footer` (opcional).
- **Events**: cap.
- **Exemple**:

```vue
<CustomCard variant="filled" padding="md">
  <template #header><CustomText as="h2" variant="body" weight="semibold">…</CustomText></template>
  …
</CustomCard>
```

- **Consumidors**: `pages/meme.vue`, MemePreview.

### CustomSection

- **Ruta**: `app/components/shared/CustomSection.vue`
- **Propòsit**: secció del CV amb `id` (àncora), eyebrow (`CustomText eyebrow primary` + icona), títol
  (`CustomText h2`) i subtítol (`CustomText body muted`); `aria-labelledby` automàtic. Les seccions `cv/*` en llegeixen
  el títol/eyebrow/icona de `ui-config/cv/sections.ts`.
- **Props**:

| Prop       | Tipus                | Default | Valors permesos → classe                         |
| ---------- | -------------------- | ------- | ------------------------------------------------ |
| `id`       | `string` (requerida) | —       | id de secció (`about`, `stack`…)                 |
| `title`    | `string` (requerida) | —       | `.custom-section__title` (`h2`, id `<id>-title`) |
| `eyebrow`  | `string`             | `''`    | `.custom-section__eyebrow`                       |
| `icon`     | `string`             | `''`    | només es mostra si hi ha eyebrow                 |
| `subtitle` | `string`             | `''`    | `.custom-section__subtitle`                      |

- **Variants/classes**: `.custom-section` (padding vertical + `scroll-mt`); elements `__header`, `__eyebrow`, `__title`, `__subtitle`.
- **Slots**: `default`.
- **Events**: cap.
- **Exemple**:

```vue
<CustomSection
  :id="config.id"
  :title="t(config.titleKey)"
  :eyebrow="t(config.eyebrowKey)"
  :icon="config.icon"
  class="tech-stack"
>…</CustomSection>
```

- **Consumidors**: AboutSection, ContactSection, EducationSection, ExperienceSection, TechStack.

### CustomSkeleton

- **Ruta**: `app/components/shared/CustomSkeleton.vue`
- **Propòsit**: placeholder animat mentre carrega (`aria-hidden`).
- **Props**:

| Prop    | Tipus                           | Default  | Valors permesos → classe                                          |
| ------- | ------------------------------- | -------- | ----------------------------------------------------------------- |
| `shape` | `'text' \| 'image' \| 'circle'` | `'text'` | `.custom-skeleton--text` (línia), `--image` (quadrat), `--circle` |

- **Variants/classes**: `.custom-skeleton`, `--text`, `--image`, `--circle`.
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<CustomSkeleton v-for="n in 8" :key="n" shape="image" />
```

- **Consumidors**: MemeGrid.

### CustomMarquee

- **Ruta**: `app/components/shared/CustomMarquee.vue`
- **Propòsit**: banner horitzontal infinit. Renderitza el slot dues vegades dins d'una pista que es desplaça
  `translateX(-50%)` en bucle (`@keyframes custom-marquee-scroll`). La segona còpia és `aria-hidden="true"` + `inert`;
  el slot rep `duplicate` perquè els enllaços de la còpia posin `tabindex="-1"`. Amb `prefers-reduced-motion:
reduce` no hi ha animació i només es veu la primera còpia. Contenidor `div` amb `aria-label` (no `role`).
- **Props**:

| Prop           | Tipus                          | Default     | Valors permesos → classe                                         |
| -------------- | ------------------------------ | ----------- | ---------------------------------------------------------------- |
| `label`        | `string` (requerida)           | —           | `aria-label` (i18n)                                              |
| `speed`        | `'slow' \| 'normal' \| 'fast'` | `'normal'`  | `.custom-marquee--slow/--normal/--fast` (durada 70s / 40s / 20s) |
| `pauseOnHover` | `boolean`                      | `true`      | `.custom-marquee--pause` (pausa a `:hover` i `:focus-within`)    |
| `tone`         | `Tone`                         | `'primary'` | `.custom-marquee--<tone>` (fons `-soft` + text del to)           |
| `size`         | `Size`                         | `'md'`      | `.custom-marquee--sm/--md/--lg` (padding vertical de la còpia)   |

- **Variants/classes**: `.custom-marquee`, `__track`, `__copy` + modificadors anteriors.
- **Slots**: `default` amb prop `{ duplicate: boolean }`.
- **Events**: cap.
- **Exemple**:

```vue
<CustomMarquee :label="t('banner.label')" speed="normal" tone="primary" size="sm">
  <template #default="{ duplicate }">
    <CustomText as="span" variant="small">… <CustomLink :href="repo" :tabindex="duplicate ? -1 : undefined">…</CustomLink></CustomText>
  </template>
</CustomMarquee>
```

- **Consumidors**: SourceBanner. Test: `tests/unit/components/CustomMarquee.spec.ts`.

---

## Layout (`app/components/layout/`)

### AppHeader

- **Ruta**: `app/components/layout/AppHeader.vue`
- **Propòsit**: capçalera fixa amb marca (`CustomLink subtle neutral`), navegació (`/`, `/meme`) amb `CustomLink nav`
  (estat actiu `.custom-link--active`) i eines (idioma, tema).
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
- **Propòsit**: marquesina (`CustomMarquee` `primary`/`sm`) que anuncia que el codi és públic: 4 còpies de
  `CustomIcon code` + `banner.source` + `CustomLink` a `profile.repo` (`banner.repo`). `data-testid="source-banner"`.
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
- **Propòsit**: peu amb crèdit (`CustomText small muted`), enllaç al codi font (`CustomLink inline`) i icones de contacte
  (`CustomLink icon`: GitHub, LinkedIn, correu) de `data/cv`.
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
- **Propòsit**: `CustomButton ghost neutral` només-icona (`sun`/`moon`) sobre `useColorMode()` (`ClientOnly`, fallback
  `div` buit per evitar mismatch d'hidratació). `data-testid="theme-toggle"`, `aria-pressed` quan és fosc.
- **Props**: cap.
- **Variants/classes**: `.theme-toggle` (caixa 40×40 sense padding, sobre `.custom-button`).
- **Slots**: cap.
- **Events**: cap.
- **Exemple**:

```vue
<ThemeToggle />
```

- **Consumidors**: AppHeader.

### LocaleSwitcher

- **Ruta**: `app/components/layout/LocaleSwitcher.vue`
- **Propòsit**: enllaços `en / ca / es` (`CustomLink subtle` amb `localize=false` sobre `useSwitchLocalePath()`);
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
- **Propòsit**: capçalera del CV: salutació (`CustomText lead muted`), nom (`CustomText h1 display`), headline
  (`CustomText h3 primary`), tagline (`body muted`), ubicació (`small muted` + icona), badge, CTA de contacte,
  descàrrega del CV i retrat (`CustomImage radius=xl frame`, `data-testid="hero-image"`). El retrat es substitueix
  pel meme de `useHeroStore` (`hero.selected.full`) i el `figcaption` (`CustomText small muted`) mostra el botó de
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
- **Propòsit**: secció `#about` (config `getSectionConfig('about')`): dos paràgrafs (`CustomText body muted`), idiomes
  i interessos (títols `CustomText h3 eyebrow muted` + badges) de `profile`.
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
  locale actiu. Tipografia: període `CustomText small muted` (+ `time`), títol `h3 body semibold`, org `body muted`
  (`CustomLink inline` si té URL), ubicació `span small muted`, bullets `li small muted`, nota `small muted`.
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
- **Propòsit**: secció `#stack`: grups de `stack` (`data/cv`) amb títol (`CustomText h3 body semibold` + icona) i badges.
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
- **Propòsit**: secció `#education`: formació i, sota un subtítol (`CustomText h3 lead semibold` + icona
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
- **Propòsit**: secció `#contact`: intro (`CustomText body muted`) i botons de correu, LinkedIn, GitHub i descàrrega del CV.
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
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'`   | passa a `CustomButton`   |
| `tone`    | `Tone`                            | `'primary'` | passa a `CustomButton`   |
| `size`    | `Size`                            | `'md'`      | passa a `CustomButton`   |

- **Variants/classes**: `.cv-download` (`div` inline-flex; l'estil visual és el d'`CustomButton`).
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
- **Propòsit**: formulari `role="search"` amb `CustomInput type=search` (`id="meme-query"`) i botó de cerca
  (`data-testid="meme-search-submit"`, desactivat si la query és buida). Emet la query retallada en fer submit.
- **Props**:

| Prop      | Tipus     | Default | Valors permesos                    |
| --------- | --------- | ------- | ---------------------------------- |
| `loading` | `boolean` | `false` | passa a `CustomButton` (`loading`) |
| `initial` | `string`  | `''`    | valor inicial del camp             |

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
  `error` → `CustomAlert danger` amb `t(errorKey)`; `success` sense resultats → `CustomAlert info`; altrament llista de
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
- **Propòsit**: targeta-botó d'un GIF: `CustomButton ghost neutral` amb `CustomImage` (`preview`, lazy) i títol
  (`CustomText span caption truncate`, visible a hover/focus/selected); `aria-pressed` i `aria-label` traduït;
  `data-testid="meme-card"`.
- **Props**:

| Prop       | Tipus              | Default | Valors permesos → classe                       |
| ---------- | ------------------ | ------- | ---------------------------------------------- |
| `meme`     | `Meme` (requerida) | —       | `#shared/types/giphy`                          |
| `selected` | `boolean`          | `false` | `.meme-card--selected` + `aria-pressed="true"` |

- **Variants/classes**: `.meme-card` (quadrat, sobre `.custom-button`), `--selected`; elements `__image`, `__title`.
- **Slots**: cap.
- **Events**: `select: [meme: Meme]`.
- **Exemple**:

```vue
<MemeCard :meme="meme" :selected="meme.id === selectedId" @select="onSelect" />
```

- **Consumidors**: MemeGrid. Test: `tests/unit/components/MemeCard.spec.ts`.

### MemePreview

- **Ruta**: `app/components/meme/MemePreview.vue`
- **Propòsit**: previsualització a mida completa (`CustomImage full radius=lg`) dins d'un `CustomCard elevated`, amb títol
  (`CustomText lead semibold`), mides (`small muted`) i botons "posar-me'l" (`data-testid="meme-use"`) / "triar-ne
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
