# Contract: Semantic spacing tokens

**Story:** `story.md` · **Declared data sources (rule 02):** none (pure CSS token refactor, no CV content
touched).

Grounded in a repo-wide tally of every `gap-`/`p-`/`px-`/`py-`/`pt-`/`pb-`/`pl-`/`pr-`/`m-`/`mx-`/`my-`/`mt-`/
`mb-`/`ml-`/`mr-`/`space-y-`/`space-x-` Tailwind utility currently used across `app/assets/css/components/*.css`,
`pages.css` and `base.css` (~40 distinct raw values, from `0` to `24`). Two tokens can't honestly absorb all of
that without a visible regression (page-level padding and icon-gap padding are not the same concern), so this
contract deliberately narrows scope to inter-element spacing — see `story.md`'s "Out of scope."

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Test that covers it                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Given `tokens.css`, When read, Then it defines `--spacing-custom-sm: 0.5rem` and `--spacing-custom-lg: 1.5rem` (decision 053 rename) in the `@theme` block, in the same style/location as `--radius-*`                                                                                                                                                                                                                                                                                                         | manual review of the diff                                                                      |
| 2   | Given any CSS file under `app/assets/css` (component files and `pages.css`) that uses a `gap-*`/`mb-*`/`mt-*`/`space-y-*`/`space-x-*` utility for spacing **between sibling elements** worth 0.5-1.5rem per the decision 055 mapping (steps 2-3 to `custom-sm`, steps 4-6 to `custom-lg`; micro gaps below 0.5rem, gaps above 1.5rem, padding and page/section rhythm stay raw), When migrated, Then it uses `gap-custom-sm`/`gap-custom-lg`/`mb-custom-sm`/`mb-custom-lg`/etc. instead of a raw numeric value | `tests/arch/css-per-component.spec.ts` (unaffected, still green) + manual diff review per file |
| 3   | Given the full `pnpm gate:push` run (gate + build + e2e), When run after migration, Then it's green — no visual regression caught by the existing e2e suite                                                                                                                                                                                                                                                                                                                                                    | `pnpm gate:push`                                                                               |
| 4   | Given `.claude/docs/catalog/styles.md`, When read, Then it documents the two new tokens, the decision 055 mapping table and the explicit list of what stays raw                                                                                                                                                                                                                                                                                                                                                | human review of the same commit's diff (rule 07)                                               |
| 5   | Given `docs/standards/styling.md`'s "Tokens" bullet, When read, Then it lists spacing alongside colors/radii/shadows as a semantic-token-only concern for inter-element gaps                                                                                                                                                                                                                                                                                                                                   | human review                                                                                   |

## Subagent assignments (rule 12)

| Subagent          | Scope                                                                                                                                                                                                             | Criteria |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| spacing-migration | Grep every component CSS file for in-scope `gap-`/`mb-`/`mt-`/`space-y-`/`space-x-` values, replace with `-sm`/`-lg`, per-file, skipping the documented exceptions; report anything ambiguous instead of guessing | 2        |

Token definition (`tokens.css`) and the catalog/standards doc updates are done by the main thread (rule 12 —
small, already-decided, no research needed).

## Standards to consult

- `.claude/docs/standards/styling.md`
- `.claude/docs/catalog/styles.md`
- `app/assets/css/tokens.css` (existing `--radius-*`/`--shadow-neu-*` pattern to mirror)

## Open questions (each with a destination)

- Exact sm/lg values and which raw values map to which bucket → decided by the AI per the user's explicit
  request ("proposa tu"), logged in `.claude/docs/decisions/050-spacing-tokens.md`, not asked back.
- Whether to add a 3rd tier for page-level rhythm later → left out of scope for now (YAGNI); revisit only if
  this 2-token system turns out insufficient once used for a while.
