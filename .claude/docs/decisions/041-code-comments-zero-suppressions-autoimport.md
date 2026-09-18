# 041 · No comments in code, zero lint/type suppressions, aggressive auto-import

**Context.** During the `post-launch` session (2026-09-18), the user asked for three related changes to how
the codebase is written, and invited `/grill-me` for anything ambiguous or contradictory. Each sub-decision
below was grilled before being applied; see the grill exchange in the session transcript for the reasoning
options that were rejected.

## Decision A — comments never live in code

Every file outside `.claude/` (components, composables, stores, services, domain, data, ui-config, pages,
plugins, server, shared types, tests, e2e, and root config files like `nuxt.config.ts`, `eslint.config.mjs`,
`vitest.config.ts`, `playwright.config.ts`) is comment-free: no `//`, no `/** */` JSDoc, no `<!-- -->` in
templates. Any explanation that would have gone in one of those comments belongs in `.claude/docs/` instead —
this is not a new place to invent, `.claude/docs/standards/` and `.claude/docs/catalog/` already exist for
exactly this (rule 07). `tests/**` and `e2e/**` are the one exception: they may keep comments (the user
explicitly named tests as one of the places comments are welcome, alongside docs/standards/rules).

**Exception, unchanged:** functional directives that a tool parses — `// eslint-disable-next-line`,
`// @ts-expect-error`, `// @ts-ignore` — are not narrative comments, they are instructions read by ESLint/TS.
They are not banned by this rule, but see Decision B: the target is zero of them anyway.

**Why.** The user's own words: comments belong in `.claude/` docs, standards, rules and tests — never in
production code. Public repo, and the catalog (rule 07) is already the documented source of truth for what
each artifact does; a comment in code duplicates or drifts from it.

## Decision B — zero lint/typecheck suppressions, ever

No `// eslint-disable*`, `// @ts-expect-error` or `// @ts-ignore` anywhere in the repo. Every ESLint/TS
complaint gets a real code fix, not a silenced line. This is now enforced the same way rule 09 enforces green
gates: `pnpm gate` must be green with **zero** suppression comments in the diff.

**Precedent fixed this session:** `app/components/shared/CustomInput.vue` had one
`// eslint-disable-next-line vue/require-default-prop` on `defineModel<T>()` (a generic model prop can't have
a literal default without breaking type safety). Fix applied: removed the disable; `vue/require-default-prop`
is configured as a `warning` (not `error`) in the underlying Nuxt ESLint config, so `pnpm lint` (`eslint .`,
no `--max-warnings`) still exits 0. The warning is accepted as-is — documented here, not silenced in code —
since no literal default can be correct for an unconstrained generic `T`.

**Why.** The user explicitly does not want disabled tooling masking real problems; they'd rather see every
open issue documented and fixed than hidden behind a suppression comment.

## Decision C — auto-import as far as Nuxt allows, explicit imports only where required

`nuxt.config.ts` now declares `imports: { dirs: ['domain/**', 'services/**', 'data/**', 'ui-config/**', 'types'] }`
(paths relative to `srcDir`, i.e. `app/`) on top of Nuxt's already-active auto-import (components via the
existing `components: [{ path: '~/components', pathPrefix: false }]`, composables under `app/composables/`,
Pinia stores via `@pinia/nuxt`, all of Vue's Composition API and vue-router composables). This closes the gap
for `app/domain/`, `app/services/`, `app/data/` and `app/ui-config/` (decision 029's layers), which are not in
Nuxt's default auto-import scope.

**Verified empirically this session** (not assumed): `npx nuxt prepare` regenerates `.nuxt/imports.d.ts`;
confirmed every symbol from those four layers appears there, and `pnpm typecheck` passes with the explicit
imports removed — including a type (`Size`) used directly inside a `defineProps<{...}>()` generic, which the
user suspected might need to stay explicit. It didn't: Nuxt's auto-import resolves before the macro is
type-checked, at least for this Nuxt/Vue/Volar version combination. If a future Nuxt upgrade regresses this,
the fix is to make that one import explicit again, not to revert the whole `imports.dirs` config.

**Housekeeping found along the way:** `app/data/cv/index.ts` was a barrel re-exporting `profile`/`experience`/
`education`/`certifications`/`stack` from their own files. With `data/**` auto-imported, the barrel caused
`unimport` "duplicated import" warnings (the same name exported from two places). Deleted the barrel; every
consumer now auto-imports the named export directly from its own file. No behavior change.

**Excluded from auto-import, deliberately: `@fortawesome/vue-fontawesome` and its sibling FontAwesome
packages.** Grilled with the user: the actual intent of the existing `no-restricted-imports` ESLint rule
(code-style.md, decisions 026/038) is not "the package may only be imported from one file" — it's "no view or
component ever renders a raw FontAwesome element; `<CustomIcon>` is the only door in." Auto-importing the
FontAwesome component globally would make it invisible to that ESLint rule (there would be no `import`
statement left to flag), silently breaking the primitive-wrapper barrier for this one package.

**Correction (2026-09-18, code review, conventions/altitude angles):** in practice, no external npm package
gets auto-imported at all right now — `nuxt.config.ts`'s `imports.dirs` only lists the project's own `app/`
subfolders (`domain/**`, `services/**`, `data/**`, `ui-config/**`, `types`), there is no `imports.presets` key
in the config. The paragraph above originally implied a preset exclusion existed; it doesn't, because no
preset was ever added for FontAwesome or anything else. The actual protection is simpler and already
general: the pre-existing `no-restricted-imports` rule blocks `@fortawesome/vue-fontawesome` outside
`CustomIcon.vue`/`app/plugins/fontawesome.ts`, and since there's no `imports.presets` entry for it, there's
nothing to auto-import around that rule in the first place. If a future package genuinely needs
auto-importing via `imports.presets`, the same reasoning applies then: check whether an ESLint import
restriction depends on that package, and keep it off the preset list if so.

**Still explicit, by design, not oversight:**

- **Components referenced as plain JS values (not as a template tag).** `app/pages/index.vue` builds a
  `Record<HomeSectionConfig['component'], Component>` map using the section components as object values —
  confirmed by a failing `pnpm typecheck` that Nuxt's component auto-import only resolves a component when
  used as a template tag (`<AboutSection />`), not as a bare identifier in script code. The 5 explicit
  `import ... from '~/components/cv/*.vue'` lines in that file stay. **Tried the obvious alternative and it
  doesn't work**: a code-review pass suggested replacing `SECTION_COMPONENTS[section.component]` with
  `resolveComponent(section.component)` (dynamic string) directly in the template, reasoning that
  `HeroSection` renders fine as a bare `<HeroSection />` tag with no import. Tested it live in the browser —
  it throws at runtime (`Cannot read properties of undefined (reading 'AboutSection')`): Vue's
  `resolveComponent()` template-compiler sugar only resolves at compile time for a **literal** string
  argument (that's how `<HeroSection />` itself gets compiled under the hood); called with a runtime
  variable, it doesn't look up Nuxt's globally-registered components the way this needed. Reverted; the 5
  explicit imports are confirmed necessary, not just assumed.
- All `import type { ... }` for types that live in files outside the newly auto-imported dirs, when the
  auto-import mechanism doesn't reach them (e.g. types from `vue` itself inside `<script generic="...">`,
  where the generic type parameter isn't resolvable through auto-import) — kept explicit case by case, only
  where actually needed, not as a blanket policy.
- Anything that isn't a JS/TS export: CSS imports (`import '~/assets/css/main.css'`), image/asset imports
  (`import photo from '~/assets/img/daniel.jpg'`), and the Tailwind Vite plugin import in `nuxt.config.ts`.
  These have no auto-import equivalent in Nuxt/Vite.

**Why.** The user wants zero explicit imports except where truly unavoidable, and asked to be told about any
real contradiction before proceeding — the FontAwesome case was exactly that, resolved above.

## Consequences

- `tests/arch/docs-sync.spec.ts` and other arch tests don't yet check "no comments in code" or "no
  suppression comments" automatically — worth a `tests/arch/no-code-comments.spec.ts` /
  `tests/arch/no-lint-suppressions.spec.ts` once this pass is committed and stable, so it doesn't regress.
  Tracked as a `todo` entry in `.claude/backlog.md`.
- `.claude/hooks/require-contract.py` now also blocks a commit that touches `nuxt.config.ts` or
  `eslint.config.mjs` without also staging a file under `.claude/docs/decisions/` in the same commit — see the
  updated "Com es comprova" note on rule 11 in `hard-rules.md` and the catalog entry in
  `.claude/docs/catalog/ai-workflow.md`. This decision file is itself the one that satisfies that check for
  this session's `nuxt.config.ts` edit.
