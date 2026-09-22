# 043 · Locale switcher becomes a `CustomInput type="select"` dropdown

**Context.** Criterion 4 of the `ux-redesign` contract asks for the locale switcher to become "a custom
(non-native) dropdown matching the app's visual style, exposed as a new `CustomInput` type (not a bespoke
one-off component)". `LocaleSwitcher.vue` previously rendered a row of 3 `CustomLink` pills (`en`/`ca`/`es`),
which also failed criterion 3 (all controls share the `h-10` height) since the pill row's height came from
its own padding, not the shared control height.

`CustomInput` already has a `type="select"` mode: a real `<select>`, restyled with `appearance-none` (no
native chrome) and already `h-10` at `size="md"` — the same height as `CustomButton`/`ThemeToggle`. Per the
ladder (native platform feature over a new component), building a fully custom `<details>`/ARIA-listbox
dropdown would duplicate keyboard nav, focus trapping and screen-reader semantics that a native `<select>`
gets for free, for no visible gain: at 3 options with flag-free text labels there is no layout `<select>`
can't do (no multi-line options, no icons required per item).

**Decision.**

- `LocaleSwitcher.vue` renders one `<CustomInput type="select" hide-label>`, bound via `:model-value="locale"`
  / `@update:model-value` (not plain `v-model`) so a selection navigates through `useSwitchLocalePath()` +
  `navigateTo()` — the same mechanism the old per-link version used — instead of mutating `locale` directly.
- `label` stays `t('locale.switch')` (already existed, already used as the nav's `aria-label`) but is now
  visually hidden (`hide-label`) to match the header's compact, icon-first tool row (next to `ThemeToggle`,
  which has no visible label either).
- Option labels are the full language name (`English`/`Català`/`Español`, from `locales[].name` in
  `nuxt.config.ts`) rather than the old 2-letter codes: a real `<select>` announces its selected option to
  screen readers and shows it to sighted users when closed, so the cryptic code loses its "list of pills"
  context and a spelled-out name reads better standalone. The switcher gets a fixed `w-32` (128px) in its own
  `locale-switcher.css` so `Español` fits comfortably.
- `custom-input.css` gains a chevron affordance for `type="select"` only (`.custom-input--select
.custom-input__field::after`), reusing the same border-trick already used for the checkbox tick
  (`border-r-2 border-b-2` + rotate), since `appearance-none` removes the native arrow and a select with zero
  visual affordance for "this opens" is a real UX regression. This is a small, shared addition to the
  primitive (rule: primitives' look changes in the primitive's CSS, never a consumer's) — it affects every
  future `type="select"` consumer, which is the intended effect (consistent select styling app-wide, not a
  one-off).

**Consequences.**

- No new dependency, no new `CustomInput` type, no bespoke component: `LocaleSwitcher.vue` shrank to a thin
  wrapper and `locale-switcher.css` shrank to a single `w-32` layout rule.
- `e2e/meme-flow.spec.ts:80` (`page.getByTestId('locale-ca').click()`) targets a per-locale pill that no
  longer exists post-change; it needs updating to drive the native `<select>` instead (e.g. `selectOption` on
  `[data-testid="locale-switcher"] select`, or `page.getByLabel(...)`). Out of this component's declared
  scope — flagged for whoever owns `e2e/` next.
- `ThemeToggle` and `CustomButton` needed no height change: both were already `h-10`/`size-10`, matching the
  select's `h-10` control — criterion 3 was already true for them, only the locale switcher was the outlier.
