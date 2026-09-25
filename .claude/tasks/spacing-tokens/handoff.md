# Handoff: spacing-tokens

**Branch:** `feat/spacing-tokens` · **Base:** `main` (`e96aa05`) · **Status:** code complete, `gate:push` green, awaiting
user push/PR.

## Real state

| Commit    | What                                                        |
| --------- | ----------------------------------------------------------- |
| `b4c4fac` | `--spacing-sm: 0.5rem` / `--spacing-lg: 1.5rem` in `@theme` |
| `c18d3ba` | inter-element gaps/margins migrated to `*-sm` / `*-lg`      |

Working tree clean except one untracked scratch file (see pendings).

## Contract criteria

| #   | State | Evidence                                                                               |
| --- | ----- | -------------------------------------------------------------------------------------- |
| 1   | done  | `tokens.css` defines both tokens next to `--radius-*`                                  |
| 2   | done  | ~20 component CSS files use `gap-sm`/`gap-lg`/`mb-sm`/`mb-lg`/`mt-lg`; exceptions kept |
| 3   | done  | `pnpm gate:push` green (2026-09-25, exit 0)                                            |
| 4   | done  | `docs/catalog/styles.md` row for `--spacing-sm/lg` + decision 050                      |
| 5   | done  | `docs/standards/styling.md` covers sibling-element spacing                             |

## Decisions taken here

- `--spacing-tight` / `--spacing-loose` rename was started in the working tree and **reverted** (2026-09-25,
  user's call): `sm`/`lg` already matches `--radius-sm/md/lg` and `--shadow-neu-sm/lg` in the same file and is
  what decision 050 records. Not revisited.

## User pendings

- Delete the leftover debug spec `e2e/_debug-tmp.spec.ts` (untracked; the `delete-test` hook blocks the AI
  from removing test files).
- Push `feat/spacing-tokens` and open the PR (rule 06: push needs explicit permission, merge is user-only).
