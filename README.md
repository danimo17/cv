# danimorales.dev

Personal CV site of Daniel Morales, frontend developer, live at [danimorales.dev](https://danimorales.dev).
Built with Nuxt 4, Vue 3, TypeScript, Tailwind v4 and Pinia, available in English, Catalan and Spanish, and
deployed to Cloudflare Workers from GitHub Actions. Beyond the CV itself, the repository is a working example of
how the author builds software with an AI collaborator under written, enforced rules: every change starts from a
story and a contract, every rule has a test or a hook that makes it binding, and the documentation the AI reads
lives in the repo and is kept in sync by the test suite.

## Table of contents

- [Purpose](#purpose)
- [Authorship and data sources](#authorship-and-data-sources)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [Layers](#layers)
  - [Directory tree](#directory-tree)
  - [Giphy data flow](#giphy-data-flow)
- [Custom primitives: one place to change everything](#custom-primitives-one-place-to-change-everything)
- [Styling system](#styling-system)
- [Internationalisation](#internationalisation)
- [Testing and quality gates](#testing-and-quality-gates)
- [AI collaboration methodology](#ai-collaboration-methodology)
- [Environments and deploy](#environments-and-deploy)
- [Getting started](#getting-started)
- [Project conventions](#project-conventions)
- [Security and privacy](#security-and-privacy)
- [License and status](#license-and-status)

## Purpose

The site has two pages:

| Route   | What it does                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`     | The CV: hero with portrait, about (languages, interests), experience, tech stack, education and certifications, contact links and a per-language PDF download. Section order comes from a declarative UI-config (`app/ui-config/cv/sections.ts`).                                  |
| `/meme` | A Giphy picker. Search a GIF, preview it and "wear" it: the GIF replaces the portrait on the home page. The selection lives in a Pinia store in memory on purpose (decision 004): it survives client-side navigation and is reset on reload, to demonstrate client state honestly. |

Theme (light/dark/system) and language do persist, via `@nuxtjs/color-mode` (localStorage) and `@nuxtjs/i18n`
(cookie) respectively (decision 005).

The second purpose of the repository is the process around the code. The `.claude/` directory contains the
binding rules, standards, decisions, living catalog and task files that the AI collaborator reads on every turn;
see [AI collaboration methodology](#ai-collaboration-methodology).

## Authorship and data sources

- **Author**: Daniel Morales ([GitHub](https://github.com/danimo17), [LinkedIn](https://www.linkedin.com/in/uptivya)).
- **CV data** comes from the author's public LinkedIn profile and his own CV PDFs (decision 006). Non-translatable
  facts (dates, organisations, URLs, tags) are in `app/data/cv/*.ts`; the text is in `i18n/locales/*.json`.
- **No employer material**: nothing in this repository is copied from any company's internal repositories,
  documents, designs or tools (rule 02). Work experience is described using public information only.
- **Public code, single writer**: the repository is public so the code can be read, but only the author can push
  and merge (decision 031). The AI collaborator commits locally to `feat/<slug>` branches and never pushes.
- **Zero cost**: every tool and service used is free (decision 030). The only expense is the domain.

## Tech stack

| Tool                                                | Role                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Nuxt 4](https://nuxt.com)                          | Framework: SSR, file-based routing, server routes (`server/api`), auto-imports, Nitro build       |
| [Vue 3](https://vuejs.org)                          | UI runtime, `<script setup>` single-file components                                               |
| TypeScript                                          | Types everywhere; `vue-tsc` runs as part of the gate                                              |
| [Tailwind CSS v4](https://tailwindcss.com)          | Design tokens via `@theme` and `@apply` inside per-component CSS files; no utilities in templates |
| [Pinia](https://pinia.vuejs.org)                    | Application state (`useGiphyStore`, `useHeroStore`)                                               |
| [@nuxtjs/i18n](https://i18n.nuxtjs.org)             | Three locales (`en`, `ca`, `es`), `prefix_except_default` routing                                 |
| [@nuxtjs/color-mode](https://color-mode.nuxtjs.org) | Light/dark/system theme with persistence                                                          |
| Font Awesome (svg-core, solid, brands)              | Icons, wrapped by `AppIcon`; only the icons registered in `app/plugins/fontawesome.ts` ship       |
| [Vitest](https://vitest.dev)                        | Unit tests (Nuxt environment, happy-dom) and architecture tests (node)                            |
| [Playwright](https://playwright.dev)                | End-to-end tests of the meme flow, theme, locale and server validation (Giphy mocked)             |
| ESLint (`@nuxt/eslint`) + Prettier                  | Conventions and formatting; both run in the gate                                                  |
| [pnpm 12](https://pnpm.io)                          | Package manager (`packageManager` pinned in `package.json`)                                       |
| Cloudflare Workers + wrangler                       | Hosting (Nitro preset `cloudflare_module`, static assets binding) and deploy CLI                  |
| GitHub Actions                                      | CI (gate + build + e2e), security scans, PR previews and production deploy                        |

## Architecture

### Layers

Decision 029 fixes a one-way dependency chain. A layer only imports from the layers to its left; nothing imports
"backwards".

```
API → Service → Store → View → UI-config
```

| Layer         | Where                                                        | Owns                                                                                         | Never does                                                                    |
| ------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **API**       | `server/api/giphy/*`, `server/utils/*`                       | Input validation (trust boundary), the Giphy key, normalising the upstream response, caching | Leak the raw upstream response or the key                                     |
| **Service**   | `app/services/<api>/<Name>Service.ts`                        | Defining the request (`useFetch`, `immediate: false`), mapping HTTP errors to i18n keys      | Hold state, know about stores or components                                   |
| **Store**     | `app/stores/*.ts` (Pinia setup stores)                       | Application state and actions (`search()`, `select()`, `reset()`)                            | Render, talk to `/api/*` directly, know about components                      |
| **View**      | `app/pages/*.vue`, `app/components/{shared,layout,cv,meme}/` | Composing components, reading stores, dispatching actions                                    | Contain business rules or HTTP calls; `shared/` primitives never touch stores |
| **UI-config** | `app/ui-config/<entity>/`                                    | Declarative configuration (home section order, icons, title keys)                            | Contain logic                                                                 |

Alongside the chain: `app/domain/<entity>/` (types and pure functions such as `formatPeriod`, no framework),
`app/data/cv/` (static tables) and `app/composables/` (framework helpers that are not application state, such as
`useMessageList`; never a `useFetch`).

### Directory tree

```
app/
  assets/css/
    tokens.css            semantic colour/radius/font tokens (@theme) + dark overrides; the only file with raw colours
    base.css              html/body defaults, focus ring, .app-shell layout, skip link
    pages.css             page-level layout classes (.page, .home-page, .meme-page)
    components/*.css      one BEM-lite CSS file per component (rule 08)
    main.css              imports everything above and defines the `dark` variant
  assets/img/             portrait (800x800 JPEG from LinkedIn, decision 013)
  components/
    shared/               App* primitives: AppText, AppInput, AppLink, AppImage, AppButton, AppIcon, AppCard, AppBadge, AppAlert, AppSection, AppSkeleton, AppMarquee
    layout/               AppHeader, AppFooter, LocaleSwitcher, ThemeToggle, SourceBanner
    cv/                   HeroSection, AboutSection, ExperienceSection, ExperienceItem, TechStack, EducationSection, ContactSection, CvDownload
    meme/                 MemeSearch, MemeGrid, MemeCard, MemePreview
  composables/            useMessageList (i18n arrays)
  data/cv/                profile, experience, education + certifications, stack (non-translatable facts)
  domain/cv/              types.ts (TimelineItem, StackGroup), period.ts (formatPeriod)
  layouts/default.vue     header, source banner, main, footer
  pages/                  index.vue (CV), meme.vue (Giphy picker)
  plugins/fontawesome.ts  icon registry
  services/giphy/         GiphyService (the only client code that knows /api/giphy)
  stores/                 giphy.ts (search state), hero.ts (selected meme)
  types/ui.ts             Tone and Size unions shared by the primitives
  ui-config/cv/           sections.ts (home section order and keys)
  app.vue                 locale head + title template
server/
  api/giphy/search.get.ts cached handler: 400 invalid query, 503 no key, 502 upstream error
  utils/giphy.ts          parseSearchQuery, toMeme
shared/types/giphy.ts     Meme and GiphySearchResponse, used by server and client
i18n/locales/             en.json, ca.json, es.json (identical structure)
public/                   favicon.svg, cv/ (PDFs per locale)
tests/
  unit/                   components, stores, services, server utils, domain, i18n parity
  arch/                   secrets, giphy-boundary, no-pii, css-per-component, docs-sync
e2e/meme-flow.spec.ts     Playwright flow against `nuxt dev` with /api/giphy mocked
.claude/                  AI methodology: hard rules, rules, standards, decisions, catalog, tasks, hooks
.github/                  workflows (ci, security, preview, deploy) and dependabot.yml
.githooks/                pre-commit (pnpm gate) and pre-push (pnpm gate:push)
```

### Giphy data flow

```
Giphy API ──► server/api/giphy/search.get.ts      validates q/limit/offset, adds the key from runtimeConfig, caches 1 h
          ──► app/services/giphy/GiphyService.ts  createSearch(query, limit) = useFetch('/api/giphy/search', { immediate: false })
                                                  toUserErrorKey(error): 400 → meme.results.badQuery, 503 → meme.results.notConfigured, else meme.results.error
          ──► app/stores/giphy.ts                 query, limit, items, status, error, errorKey; action search(q)
          ──► app/pages/meme.vue                  composes MemeSearch, MemeGrid, MemePreview; on "use" calls useHeroStore().select(meme)
          ──► app/components/cv/HeroSection.vue   renders hero.selected.full instead of the portrait, with a reset button
```

The Giphy key is only read on the server (`runtimeConfig.giphyApiKey`, populated from `NUXT_GIPHY_API_KEY`). The
client never sees it. `tests/arch/giphy-boundary.spec.ts` fails if `api.giphy.com` appears outside `server/` or if
`/api/giphy` appears outside `app/services/giphy/` and `server/`.

## Custom primitives: one place to change everything

Decision 026: every HTML "leaf" element goes through exactly one project component. Native text, form, link and
image elements are forbidden in `app/**/*.vue` by the ESLint rule `vue/no-restricted-html-elements`; only the
primitive that wraps each element is exempt. Structural elements (`div`, `section`, `article`, `header`, `footer`,
`nav`, `ul`, `ol`, `li` without its own text, `figure`, `form`, `fieldset`, `legend`) stay native.

The consequence is that restyling the site, or swapping the primitives for a component library such as PrimeVue,
means touching one `.vue` file and one CSS file per primitive. Consumers do not change.

| Primitive     | Replaces                                                                                       | Key props                                                                                                                                           | CSS file                                     |
| ------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `AppText`     | `p`, `span`, `h1`–`h6`, `small`, `strong`, `em`, `label`, `figcaption`, `time`, `li` with text | `as`, `variant` (`display h1 h2 h3 lead body small caption eyebrow`), `tone`, `weight`, `align`, `truncate`                                         | `app/assets/css/components/app-text.css`     |
| `AppInput`    | `input` (all types), `select`, `textarea`                                                      | `id`, `label`, `type` (`text search email number textarea select multiselect radio checkbox`), `options`, `hint`, `tone`, `size`, `icon`, `v-model` | `app/assets/css/components/app-input.css`    |
| `AppLink`     | `a`, `NuxtLink`, `NuxtLinkLocale`                                                              | `to` / `href`, `variant` (`inline nav subtle icon`), `tone`, `localize`, `download`                                                                 | `app/assets/css/components/app-link.css`     |
| `AppImage`    | `img`                                                                                          | `src`, `alt`, `width`, `height`, `loading`, `fit`, `radius`, `frame`                                                                                | `app/assets/css/components/app-image.css`    |
| `AppButton`   | `button`, and `a`/`NuxtLinkLocale` used as a button                                            | `tone`, `size`, `variant` (`solid outline ghost`), `icon`, `to` / `href`, `type`, `loading`, `disabled`, `block`                                    | `app/assets/css/components/app-button.css`   |
| `AppIcon`     | `FontAwesomeIcon` (importing `@fortawesome/vue-fontawesome` elsewhere is a lint error)         | `name`, `set` (`solid brands`), `size`, `label`                                                                                                     | `app/assets/css/components/app-icon.css`     |
| `AppCard`     | Card containers                                                                                | `as`, `variant` (`outline filled elevated`), `padding`; slots `header`, `footer`                                                                    | `app/assets/css/components/app-card.css`     |
| `AppBadge`    | Inline tags                                                                                    | `tone`, `variant` (`soft solid`), `size`, `icon`                                                                                                    | `app/assets/css/components/app-badge.css`    |
| `AppAlert`    | Status messages                                                                                | `tone`, `title`, `icon`; `role` is `alert` or `status` depending on tone                                                                            | `app/assets/css/components/app-alert.css`    |
| `AppSection`  | CV sections with anchor, eyebrow, title, subtitle                                              | `id`, `title`, `eyebrow`, `icon`, `subtitle`                                                                                                        | `app/assets/css/components/app-section.css`  |
| `AppSkeleton` | Loading placeholders                                                                           | `shape` (`text image circle`)                                                                                                                       | `app/assets/css/components/app-skeleton.css` |
| `AppMarquee`  | Infinite horizontal banner                                                                     | `label`, `speed`, `pauseOnHover`, `tone`, `size`; slot prop `duplicate`; respects `prefers-reduced-motion`                                          | `app/assets/css/components/app-marquee.css`  |

`AppText` is the only owner of typography: sizes, weights and text colours exist in `app-text.css` and nowhere
else. Section CSS files only contain layout and spacing.

```vue
<AppText as="h1" variant="display">{{ profile.name }}</AppText>
<AppText as="p" variant="body" tone="muted">{{ t('about.p1') }}</AppText>
<AppText as="time" variant="small" tone="muted" :datetime="item.start">{{ period }}</AppText>

<AppInput
  id="meme-query"
  v-model="query"
  type="search"
  :label="t('meme.search.label')"
  icon="magnifying-glass"
  hide-label
/>
<AppInput
  id="level"
  v-model="level"
  type="radio"
  :label="t('x.level')"
  :options="[
    { value: 'junior', label: 'Junior' },
    { value: 'senior', label: 'Senior' },
  ]"
  tone="danger"
  :hint="t('x.required')"
/>
```

Every primitive has a block in `.claude/docs/catalog/components.md` listing all props, their allowed values and
the CSS class each value activates. That file is the living reference; `tests/arch/docs-sync.spec.ts` fails when a
component exists without a block or a block points to a deleted component.

## Styling system

- **Semantic tokens** (`app/assets/css/tokens.css`, Tailwind v4 `@theme`): `surface`, `surface-alt`, `border`,
  `text`, `text-muted`, plus three tokens per tone (`primary`, `secondary`, `neutral`, `success`, `info`, `warning`,
  `danger`): `--color-<tone>` (the colour), `--color-<tone>-fg` (text on a solid background of that tone) and
  `--color-<tone>-soft` (soft background for badges, alerts, hover states). Also `--font-sans`, `--font-mono` and
  `--radius-sm/md/lg/xl`. This is the only file with raw colour values.
- **Real dark mode**: the same token names are redefined under `.dark`, so no component ever writes `dark:`. The
  `dark` variant is declared in `main.css` as `@custom-variant dark (&:where(.dark, .dark *))` and toggled by
  `@nuxtjs/color-mode` (`classSuffix: ''`).
- **One CSS file per component** (rule 08): `Name.vue` has `app/assets/css/components/<kebab-name>.css`, imported
  from `main.css`, with a `.kebab-name` root block, `--modifier` classes for variants/tones/sizes/states and
  `__element` classes for parts, all built with `@apply` of tokens inside `@layer components`.
  `tests/arch/css-per-component.spec.ts` checks the file exists, is imported, declares the block, the template
  uses it, and that there are no orphan CSS files or dangling imports.
- **No utility classes in templates**: `vue/no-restricted-class` rejects `bg-`, `text-`, `p-`, `m-`, `gap-`,
  `rounded-`, `border-`, `shadow-`, `font-`, `w-`, `h-`, `size-` and friends in templates. The allowed list of
  layout utilities in templates is empty. Passing `class="block__part"` to a child component is fine: the child
  merges it onto its root.
- **Visual style**: decision 025 sets neumorphism (soft UI: surfaces the colour of the background, relief by
  double shadow, inset pressed states, large radii, AA text contrast, visible focus ring) while keeping system
  fonts, no webfonts and real dark mode. At the time of writing the CSS is the flat baseline; the neumorphism pass
  adds shadow tokens to `tokens.css` and touches only the component CSS files, never the components or their
  classes.
- **Motion** respects `prefers-reduced-motion: reduce` (see `app-marquee.css`).

How to customise:

| Change                                | Where                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| A global colour (light or dark)       | `tokens.css`; every primitive and state derives from it                                                                              |
| Typography                            | `app-text.css` (variants) or `tokens.css` (`--font-*`)                                                                               |
| The look of a primitive               | Its `app-<name>.css`; consumers are untouched                                                                                        |
| Add a tone                            | 6 token values (3 light, 3 dark) in `tokens.css` + entry in `TONES` (`app/types/ui.ts`) + modifiers in the primitives that use tones |
| Add a variant or state to a primitive | Prop value + `.app-<name>--<value>` modifier + row in `.claude/docs/catalog/components.md` and `styles.md`                           |
| A new section or page                 | Layout only in its `<kebab>.css`; text via `AppText`, links via `AppLink`, images via `AppImage`                                     |

Full token, scale and class reference: `.claude/docs/catalog/styles.md`.

## Internationalisation

- Locales: `en` (default, no URL prefix), `ca` and `es` (prefixed: `/ca`, `/es/meme`). Strategy
  `prefix_except_default`; browser language detection with the `i18n_redirected` cookie, only on the root URL
  (decision 008, `nuxt.config.ts`).
- Files: `i18n/locales/{en,ca,es}.json` with an identical structure. `en` is the source; `ca` and `es` are
  translated in the same change.
- Key structure: `<area>.<entity>.<field>`, for example `nav.home`, `hero.cta.contact`,
  `experience.items.<id>.title`, `experience.items.<id>.bullets[]`, `meme.results.empty`. Arrays are read with
  `useMessageList(key)`. JSON holds text only; dates, URLs, organisation names and tags live in `app/data/cv/*.ts`.
- Rule 05: no bare strings in templates (`vue/no-bare-strings-in-template`); all text, including `alt`,
  `aria-label`, `placeholder` and `title`, goes through `t()` and is rendered with `AppText`.
- `tests/unit/i18n-parity.spec.ts` flattens the three files and fails on any missing or extra key, and on any
  empty string in `ca` or `es`.
- Adding a locale: entry in `nuxt.config.ts` `i18n.locales`, a complete JSON, `public/cv/cv-<code>.pdf`, and a
  row in `.claude/docs/catalog/i18n.md`.

## Testing and quality gates

### Test layers

| Layer         | Tool                                      | Covers                                                                                                                                                                                                                                                          | Where                            |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Unit          | Vitest, environment `nuxt` with happy-dom | Primitives with logic (`AppButton`, `AppInput`, `AppAlert`, `AppMarquee`, `MemeCard`), stores (`registerEndpoint` simulating 200/400/503), `GiphyService`, `server/utils/giphy`, `formatPeriod`, i18n parity                                                    | `tests/unit/**`                  |
| Architecture  | Vitest, environment `node`                | Invariants no linter expresses (see below)                                                                                                                                                                                                                      | `tests/arch/**`                  |
| End-to-end    | Playwright (chromium) against `nuxt dev`  | Home renders all sections and the source banner; search, pick and wear a meme, then reload restores the portrait; theme persists; locale switch; `/api/giphy/search` returns 400 on bad input. `/api/giphy/**` is mocked with `page.route`, so no key is needed | `e2e/**`                         |
| Security (CI) | gitleaks, `pnpm audit`, CodeQL            | Secrets in the whole git history, vulnerable dependencies (`--audit-level=high`), insecure patterns (javascript-typescript)                                                                                                                                     | `.github/workflows/security.yml` |

Architecture tests, each enforcing a rule:

| Test                                   | Enforces                                                                                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/arch/secrets.spec.ts`           | Rule 01: no dotenv or `.dev.vars` file tracked, no line matching a `NUXT_GIPHY_API_KEY=<key-like value>`, the Giphy key parameter parameter only under `server/` |
| `tests/arch/giphy-boundary.spec.ts`    | Rule 03: `api.giphy.com` only in `server/`; `/api/giphy` only in `app/services/giphy/` and `server/`; no composable talks to it                                  |
| `tests/arch/no-pii.spec.ts`            | Rule 04: no phone number or postal code in `app/data/cv/*.ts`, `i18n/locales/*.json` or the text layer of `public/cv/*.pdf` (Spotlight + inflated streams)       |
| `tests/arch/css-per-component.spec.ts` | Rule 08: one imported CSS file per component, declaring and using its block; no orphans                                                                          |
| `tests/arch/docs-sync.spec.ts`         | Rule 07: every component, store, composable, util, service class, domain function and ui-config export has a `###` block in the catalog                          |

### Scripts

| Script                         | Runs                                                         | Called by              |
| ------------------------------ | ------------------------------------------------------------ | ---------------------- |
| `pnpm gate`                    | `format:check` + `lint` + `typecheck` + `test` (unit + arch) | `pre-commit`, `ci.yml` |
| `pnpm gate:push`               | `gate` + `build` + `test:e2e`                                | `pre-push`             |
| `pnpm test` / `test:watch`     | Vitest once / in watch mode                                  | you                    |
| `pnpm test:arch`               | Only `tests/arch`                                            | you                    |
| `pnpm test:e2e`                | Playwright (starts `pnpm dev --port 3100` itself)            | `gate:push`, `ci.yml`  |
| `pnpm lint` / `lint:fix`       | ESLint                                                       | `gate`                 |
| `pnpm format` / `format:check` | Prettier                                                     | `gate`                 |
| `pnpm typecheck`               | `nuxt typecheck` (vue-tsc)                                   | `gate`                 |

### Hooks

| Hook                                        | Kind                                 | Does                                                                                                                                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.githooks/pre-commit`                      | git hook (`core.hooksPath`)          | `exec pnpm gate`                                                                                                                                                                                                                                                            |
| `.githooks/pre-push`                        | git hook                             | `exec pnpm gate:push`                                                                                                                                                                                                                                                       |
| `.claude/hooks/require-contract.sh` → `.py` | Claude Code `PreToolUse` hook (Bash) | Inspects real `git commit` / `git push` invocations in the command. Blocks `--no-verify` / `-n` (rule 09) and any commit without `.claude/tasks/ACTIVE` pointing to a `contract.md` that contains Given/When/Then criteria (rule 10). Exit code 2 = blocked, reason printed |

`pnpm install` runs the `prepare` script, which sets `git config core.hooksPath .githooks`, so the git hooks are
active without any manual step. The Claude hook is wired in `.claude/settings.json`.

### Workflows

| Workflow       | Trigger                                                 | Job (= required check name)         | What it does                                                                                                         |
| -------------- | ------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`       | `pull_request`, `push` to `main`                        | `gate`                              | `pnpm gate`, `pnpm build`, Playwright e2e (chromium). Uploads `playwright-report` on failure                         |
| `security.yml` | `pull_request`, `push` to `main`, Mondays 06:00 UTC     | `gitleaks`, `audit`, `CodeQL`       | Full-history secret scan, `pnpm audit --audit-level=high`, CodeQL javascript-typescript                              |
| `preview.yml`  | `pull_request`                                          | `preview`                           | `wrangler versions upload --preview-alias pr-<n>` and comments the URL on the PR; skipped when no Cloudflare secrets |
| `deploy.yml`   | `workflow_run` of `ci` completed successfully on `main` | `deploy` (environment `production`) | Checks out the exact `head_sha`, builds, `wrangler deploy`, uploads `NUXT_GIPHY_API_KEY` to the Worker               |

Dependabot (`.github/dependabot.yml`) opens weekly PRs for npm (minor and patch grouped, majors individually)
and for GitHub Actions (grouped).

### Branch ruleset

`main` is protected by a GitHub ruleset (decision 024): pull request required, required status checks `gate`,
`gitleaks`, `audit` and `CodeQL` (job names, so renaming a job breaks the ruleset), code-scanning rule with
CodeQL, no force push, no deletion, no bypass actors. The exact JSON and the `gh api` call are in
`.claude/docs/catalog/ai-workflow.md`.

### What blocks what

| Gate                              | Runs                                         | Blocks                 |
| --------------------------------- | -------------------------------------------- | ---------------------- |
| `pre-commit` (git hook)           | `pnpm gate`                                  | the commit             |
| `pre-push` (git hook)             | `pnpm gate:push`                             | the push               |
| `require-contract` (Claude hook)  | checks the active contract and `--no-verify` | commits made by the AI |
| `git-safety` (global Claude hook) | commit/push to `main`                        | the command            |
| CI `ci.yml`                       | gate + build + e2e                           | merging the PR         |
| `security.yml`                    | gitleaks, pnpm audit, CodeQL                 | merging the PR         |
| `main` ruleset (GitHub)           | requires the checks above + a PR             | direct merges          |
| `deploy.yml`                      | only on push to `main` with green CI         | the deploy             |

The legitimate way to unblock is to make it pass. Never `--no-verify`, never skip, never delete the test.

## AI collaboration methodology

The `.claude/` directory mirrors the author's AI methodology document (decision 028). `CLAUDE.md` at the repo root
is the entry point: it imports `.claude/hard-rules.md` on every turn and maps the rest of the context by territory.

| Path                              | Contents                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/hard-rules.md`           | The 12 binding rules, each with what enforces it (table below)                                                                                                                                                                        |
| `.claude/rules/NN-<slug>.md`      | One file per rule: what, why, how it is checked                                                                                                                                                                                       |
| `.claude/docs/standards/*.md`     | How each territory is written: `components`, `styling`, `code-style`, `state`, `i18n`, `testing`                                                                                                                                      |
| `.claude/docs/decisions/NNN-*.md` | ADR-style records (context, decision, consequences). Once recorded, a decision is never asked again in the same situation; superseded ones say so (009 → 029, 011 → 025)                                                              |
| `.claude/docs/catalog/*.md`       | Living documentation of what exists: `components` (every prop and the class it activates), `styles`, `state`, `i18n`, `ai-workflow`. Updated in the same commit as the artefact (rule 07), enforced by `tests/arch/docs-sync.spec.ts` |
| `.claude/tasks/<slug>/`           | `story.md`, `contract.md`, `handoff.md` for the active task; `.claude/tasks/ACTIVE` holds the slug. Deleted when the task closes                                                                                                      |
| `.claude/templates/*.md`          | Templates for story, contract, handoff and the pre-commit review checklist                                                                                                                                                            |
| `.claude/workflow.md`             | The binding lifecycle and the "what blocks what" table                                                                                                                                                                                |
| `.claude/backlog.md`              | Stories with state and folder                                                                                                                                                                                                         |
| `.claude/hooks/`                  | The `require-contract` hook                                                                                                                                                                                                           |

### The 12 hard rules

| #   | Rule                                                                                                                                                             | Enforced by                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 01  | No secret in the repo, the chat or the logs. Only a local dotenv file (ignored) and GitHub/Cloudflare secrets. An exposed key is regenerated                     | `.gitignore`, `tests/arch/secrets.spec.ts`, gitleaks in CI                                           |
| 02  | No internal code or resource from any employer. Public information only                                                                                          | Human review of the contract's declared sources and the review checklist                             |
| 03  | Giphy is called only from `server/api/giphy/*`; the client only via `GiphyService` → `useGiphyStore`                                                             | `tests/arch/giphy-boundary.spec.ts`                                                                  |
| 04  | No sensitive personal data (phone, postal address) on the site or in the PDFs, text layer included                                                               | `tests/arch/no-pii.spec.ts` + review                                                                 |
| 05  | No hardcoded user-facing strings; every key exists in the three locales                                                                                          | `vue/no-bare-strings-in-template`, `tests/unit/i18n-parity.spec.ts`                                  |
| 06  | The AI always works on `feat/<slug>`; never commits to `main`, never pushes                                                                                      | Global `git-safety` Claude hook, GitHub branch ruleset                                               |
| 07  | New or changed component, store, composable, token or key → catalog updated in the same commit                                                                   | `tests/arch/docs-sync.spec.ts`                                                                       |
| 08  | One CSS file per component; only its own semantic classes in the template; typography only through `AppText`; native leaf elements only inside `App*` primitives | `tests/arch/css-per-component.spec.ts`, `vue/no-restricted-class`, `vue/no-restricted-html-elements` |
| 09  | No commit without a green `pnpm gate`; no push without `pnpm gate:push`; no merge to `main` without CI + security green. Never `--no-verify`                     | `.githooks/*`, CI, branch ruleset, `require-contract` hook                                           |
| 10  | No code without a story and a contract with Given/When/Then criteria in `.claude/tasks/<slug>/`                                                                  | `require-contract` hook (blocks `git commit`)                                                        |
| 11  | A clear directive that cannot be followed → direct question with options, never a silent substitution. Every decision goes to `docs/decisions/`                  | Human review; `docs/decisions/` is the memory                                                        |
| 12  | The main thread orchestrates (contracts, decisions, synthesis, gates); research and development are delegated to subagents                                       | Human review; `workflow.md`; the handoff lists which subagent did what                               |

### Lifecycle

```
story → contract → build ⟲ iterate → consolidate (gate) → review → validate → handoff → commit → PR → CI+security → merge → deploy
```

1. **Story** (`story.md`): "As <actor> I want <what> so that <value>", out of scope, external dependencies. Added
   to the backlog as `doing`; `ACTIVE` gets the slug; branch `feat/<slug>`.
2. **Contract** (`contract.md`): Given/When/Then acceptance criteria, each with the test file and name that will
   cover it; declared data sources (rule 02); standards to consult; open questions with a destination
   (`decided:`, `owner:` or a decision number). Written by the main thread; the hook blocks commits without it.
3. **Build / iterate**: the main thread splits the contract into self-contained assignments for subagents
   (rule 12), by layer (config → server → state → components → pages). Each artefact ships with its CSS, its
   catalog block and its test. Each correction requested by the human gains a test in the same change.
4. **Consolidate**: `pnpm gate`. Failures are fixed; a wrong test is justified in the contract, not skipped.
5. **Review**: `templates/review-checklist.md` before the first commit. A finding is a claim: open the file and
   confirm before acting.
6. **Validate**: the real output of `pnpm gate` / `gate:push` goes into `handoff.md`, plus what the suite does not
   cover.
7. **Handoff** (`handoff.md`): the true state of the branch, which subagents did what, and the **"Pendents de
   l'usuari"** table (things only the human can do: keys, secrets, PDFs, push). Updated whenever something stops
   being true.
8. **Commit / PR**: commits on `feat/<slug>` (pre-commit = gate). The human pushes and opens the PR; CI repeats
   the gate, builds, runs e2e and security scans, and posts a preview URL.
9. **Merge / deploy**: the human merges; GitHub only allows it with every check green. Merging to `main` deploys
   to production automatically.
10. **Close**: promote what is durable to `standards/`, `decisions/` and `catalog/`; delete `tasks/<slug>/`;
    empty `ACTIVE`; mark `done` in the backlog.

## Environments and deploy

| Environment    | How                                                                                                                                 | Giphy secret                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **local**      | `pnpm dev` with a local `.env` file (`NUXT_GIPHY_API_KEY`)                                                                          | `.env`, never committed                              |
| **preview**    | One ephemeral URL per PR: `pr-<n>-cv.<subdomain>.workers.dev` (stable alias) plus a per-version URL, via `wrangler versions upload` | Inherits the production Worker's secrets             |
| **production** | Worker `cv` at [danimorales.dev](https://danimorales.dev) (`workers_dev: false`, custom domain route in `wrangler.jsonc`)           | Uploaded by `deploy.yml` from GitHub on every deploy |

- There is no staging environment and no `develop` branch (decision 021).
- Production deploys only from `deploy.yml`, triggered by `workflow_run` when `ci` finishes successfully on a
  `push` to `main`. It checks out the exact `head_sha` that passed the gate, builds and runs `wrangler deploy`
  with `concurrency: production` (never cancelling an in-progress deploy). Workers Builds is not used.
- The PR merge is the approval: the `production` GitHub environment has no reviewers or wait timer.
- Previews only work once the Worker exists (after the first production deploy) and only on `workers.dev`, never
  on the custom domain. `preview_urls: true` is set explicitly in `wrangler.jsonc` because it defaults to the value
  of `workers_dev`.
- `pnpm cf:dev` / `pnpm cf:deploy` run wrangler locally for experiments; the real deploy is the workflow.

### Secrets

| Secret                  | Where (GitHub)                          | Who sets it                       | Used by                                                | Rotation                                                          |
| ----------------------- | --------------------------------------- | --------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | environment `production` and repository | the author (Cloudflare dashboard) | `deploy.yml` (environment), `preview.yml` (repository) | New token in Cloudflare → update both places → revoke the old one |
| `CLOUDFLARE_ACCOUNT_ID` | environment `production` and repository | the author                        | same                                                   | Does not rotate                                                   |
| `NUXT_GIPHY_API_KEY`    | environment `production`                | the author (developers.giphy.com) | `deploy.yml` uploads it to the Worker                  | Change it in GitHub → next deploy (or re-run `deploy`)            |

GitHub is the single source of truth for secrets: the Cloudflare dashboard is not edited by hand, and anything
set there is overwritten by the next deploy. Repository secrets exist because environment secrets are not
available to jobs without `environment:`, and a PR should not need the production environment. Fork PRs receive
no secrets at all, so preview and deploy never run for third parties. Details: `.claude/docs/catalog/ai-workflow.md`.

## Getting started

Prerequisites: Node 24 (`.node-version`; `engines` allows ≥ 22) and pnpm 12 (`packageManager` in `package.json`;
`corepack enable` or `npm i -g pnpm@12` will do).

```bash
git clone git@github.com:danimo17/cv.git
cd cv
pnpm install              # also runs `nuxt prepare` and wires .githooks via core.hooksPath
cp .env.example .env      # then set NUXT_GIPHY_API_KEY (https://developers.giphy.com, API app)
pnpm dev                  # http://localhost:3000
```

Notes on `pnpm install`:

- `pnpm-workspace.yaml` → `allowBuilds` lists the only dependencies allowed to run build scripts (`esbuild`,
  `unrs-resolver`, `workerd`). A new dependency with a `postinstall` fails the install until it is added there;
  `dangerouslyAllowAllBuilds` is never used.
- pnpm 12's `minimumReleaseAge` (default one day) also applies to the lockfile: a version published less than a
  day ago fails the install, in CI too. Point exceptions go in `minimumReleaseAgeExclude` (currently `wrangler`
  and `miniflare`) and are removed when no longer needed.
- CI always installs with `--frozen-lockfile`.

Without a Giphy key the site runs, `/meme` searches return 503 and the page shows the "not configured" message.
The e2e suite mocks `/api/giphy/**`, so it never needs the key.

| Command           | What it does                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `pnpm dev`        | Nuxt dev server                                                                                        |
| `pnpm build`      | `nuxt build` with the `cloudflare_module` preset → `.output/`                                          |
| `pnpm preview`    | `nuxt preview` (note: the Cloudflare build does not run under Node; use `cf:dev`)                      |
| `pnpm cf:dev`     | `wrangler dev` on the built output                                                                     |
| `pnpm gate`       | Format check, lint, typecheck, unit + architecture tests                                               |
| `pnpm gate:push`  | `gate` + build + e2e                                                                                   |
| `pnpm test`       | Vitest once                                                                                            |
| `pnpm test:watch` | Vitest in watch mode                                                                                   |
| `pnpm test:arch`  | Architecture tests only                                                                                |
| `pnpm test:e2e`   | Playwright; starts `pnpm dev --port 3100` itself (first time: `pnpm exec playwright install chromium`) |
| `pnpm lint:fix`   | ESLint with autofix                                                                                    |
| `pnpm format`     | Prettier write                                                                                         |
| `pnpm typecheck`  | `nuxt typecheck`                                                                                       |
| `pnpm cf:deploy`  | `wrangler deploy` from your machine (for experiments only; production deploys via GitHub Actions)      |

Building for Cloudflare: `pnpm build` produces `.output/server/index.mjs` and `.output/public`, which
`wrangler.jsonc` points at (`main` and `assets`). `nodejs_compat` is enabled and observability is on.

## Project conventions

**Formatting and linting** (decision 016, `.claude/docs/standards/code-style.md`): Prettier with no semicolons,
single quotes, 100 columns, ES5 trailing commas. ESLint through `@nuxt/eslint` (stylistic off) plus explicit rules:

| Rule                                    | Means                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `vue/block-order`                       | `<script setup>` before `<template>`; no `<style>` blocks (CSS lives in `assets/css/components/`) |
| `vue/define-macros-order`               | `defineOptions` → `defineProps` → `defineEmits` → `defineSlots`                                   |
| `vue/component-name-in-template-casing` | `<AppButton>`, never `<app-button>`                                                               |
| `vue/require-explicit-emits`            | Typed `defineEmits<{ select: [Meme] }>()`                                                         |
| `vue/no-bare-strings-in-template`       | Every user-facing string is `t('…')`                                                              |
| `vue/no-restricted-class`               | No Tailwind utilities in templates                                                                |
| `vue/no-restricted-html-elements`       | Native leaf elements only inside their `App*` primitive                                           |
| `@typescript-eslint/no-explicit-any`    | Concrete types or `unknown` + narrowing                                                           |
| `no-console`                            | Throw `createError` or return state; `server/` may use `error`/`warn`                             |
| `no-restricted-imports`                 | `@fortawesome/vue-fontawesome` only inside `AppIcon` and the plugin                               |
| `sort-imports`                          | Sorted import members                                                                             |

Other conventions (checked in review): files `kebab-case.ts`, components `PascalCase.vue` and multi-word,
composables `useX.ts`, stores `useXStore`, standard prop names `tone` / `size` / `variant` / `loading` /
`disabled` / `selected` / `block`, shared types in `app/types/ui.ts`.

**`// ponytail:` comments** mark deliberate simplifications: they state the ceiling of the current approach and
the upgrade path (for example the PDF text-extraction fallback in `tests/arch/no-pii.spec.ts`, or running e2e
against `nuxt dev` in `playwright.config.ts`).

**Git**: the AI works on `feat/<slug>` where `<slug>` is the active task; every commit passes `pnpm gate` (hook),
every push passes `pnpm gate:push` (hook); only the author pushes, opens PRs and merges; `main` only changes via
PRs with green checks. Commits from the AI additionally require an active contract.

## Security and privacy

- **Secrets**: never in the repo, the chat or the logs (rule 01). Locally they live in the ignored `.env` file
  (`.env.example` has names only); in production in GitHub secrets that the deploy workflow pushes to the Worker.
  `tests/arch/secrets.spec.ts` runs on every commit; gitleaks scans the full history in CI; GitHub secret scanning
  is active because the repo is public. An exposed key is regenerated, not deleted.
- **Giphy key isolation**: `runtimeConfig.giphyApiKey` is server-only (never `runtimeConfig.public`); the
  server route validates input (query length and characters, `limit` 1–25, `offset` 0–4999), calls Giphy with
  `rating: pg`, caches results for one hour, and never forwards the raw upstream response or error.
- **No PII** (rule 04): no phone number or postal address anywhere on the site or in the CV PDFs. Contact is
  email, GitHub and LinkedIn only. PDFs are checked at the text layer (a visually hidden phone number is still
  indexed) and live only inside the repo (decision 032): export → verify text → move → commit.
- **No employer material** (rule 02): declared data sources in every contract and a review checklist item.
- **Supply chain**: `--frozen-lockfile`, `allowBuilds` allowlist, `minimumReleaseAge`, `pnpm audit` at high
  severity, Dependabot weekly, pinned GitHub Actions majors.
- **Fork PRs** get no secrets, so they cannot upload previews or deploy; only the author can merge them.
- **Browser policy** for the AI (decision 007): never the author's real browser sessions; anything that needs a
  login is done by the author.

## License and status

The source code is released under the [MIT License](LICENSE): reuse the structure, the primitives and the
governance freely. Personal content (portrait photo, CV texts and data, the PDFs under `public/cv/`) is **all
rights reserved** and is excluded from that license; see [CONTENT-LICENSE.md](CONTENT-LICENSE.md).

Status: first release in progress on branch `feat/bootstrap` (see `.claude/tasks/bootstrap/handoff.md`).
