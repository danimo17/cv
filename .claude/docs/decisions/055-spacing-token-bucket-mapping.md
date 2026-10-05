# 055 · Spacing tokens: explicit bucket mapping, micro gaps and large gaps stay raw

**Context.** Decision 050 scoped the two spacing tokens to "spacing between sibling elements" and said values
that "don't cleanly fit either bucket" stay raw, but never fixed numeric bounds. The migration (`c18d3ba`)
therefore rounded every in-range-looking value to the nearest token: `gap-1`/`gap-1.5` (0.25/0.375rem) became
`custom-sm` (0.5rem), doubling or more the tightest gaps (badge icon + text, nav link gaps, bullet/tag gaps),
while `gap-3` (0.75rem) and `gap-4` (1rem) became `custom-sm`/`custom-lg`. A `/code-review` (2026-10-04) flagged
the two-tier rounding as lossy and the catalog's bucket rule ("0.25-0.75rem vs 1-1.5rem") as ambiguous: it
contradicted what the migration actually did. The same review found `pages.css`'s meme-page sibling spacing
had been skipped because the docs excluded the file wholesale.

**Decision.** One explicit mapping rule, by Tailwind step, for raw sibling-spacing utilities (`gap`, `gap-x`,
`gap-y`, `mt`, `mb`, `ml`/`mr`/`mx`/`my` when they separate siblings, `space-x`, `space-y`):

| Raw step                 | Value          | Result                                                                            |
| ------------------------ | -------------- | --------------------------------------------------------------------------------- |
| `0.5`, `1`, `1.5`        | 0.125-0.375rem | stays raw (micro gaps: icon + text in badges, nav link gaps, bullet and tag gaps) |
| `2`, `3`                 | 0.5-0.75rem    | `custom-sm` (0.5rem)                                                              |
| `4`, `5`, `6`            | 1-1.5rem       | `custom-lg` (1.5rem)                                                              |
| `8`, `10`, `12`, `16` .. | 2rem and up    | stays raw (section/page rhythm, layout gaps)                                      |

Consequences of the mapping that are accepted, not accidents: step 3 (0.75rem) tightens to 0.5rem, and step 4
(1rem) loosens to 1.5rem. Those are the only two visible shifts inside the range, and they are the price of
having two tokens; they were already present in the original migration and are now stated.

This amends decision 050's scope text only (the "doesn't cleanly fit either bucket" wording, and the wholesale
exclusion of `pages.css`). The tokens, values and names (050, 053) are unchanged. Page and section rhythm
exclusion now applies only to section-wrapper padding and to values outside the 0.5-1.5rem range, not to a
file as a whole. Padding utilities (`p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`) are not sibling spacing and stay
raw everywhere.

**Consequences.** Reverted to their raw `main` values: `custom-badge` `gap-1`, `app-header__nav` `gap-1`,
`app-footer__links` `gap-1`, `experience-item` base `gap-1`, `__body` `gap-1`, `__bullets` `space-y-1`,
`__tags` `gap-1.5`, `hero-section__meta-item` `gap-1.5`, `meme-preview__meta` `mt-1`. Migrated under the rule:
`pages.css` `.meme-page__kicker`/`__intro`/`__how-title`/`__steps`/`__how-cta`, plus the in-range sibling gaps
in `custom-button.css` and `custom-input.css` that the old "control padding" exception had over-covered (that
exception is about `px-*`/`py-*` tied to the `Size` scale, not about `gap`). `.claude/docs/catalog/styles.md`
carries the mapping table and the exact list of what stays raw; `standards/styling.md` points to it.
