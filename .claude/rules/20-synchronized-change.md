# 20 · Synchronized change: no orphaned references

**What.** A change to a public surface — a `data-testid`, a component prop, a CSS class, an i18n key, a store or
composable name, a route — updates every reference to it in the same change: the catalog (rule 07), the unit and
e2e tests, and the docs (`.claude/docs/`). Removing or renaming something is never finished until a repo-wide
grep for the old name (`app/`, `server/`, `shared/`, `tests/`, `e2e/`, `.claude/docs/`) returns nothing that should
still point to it. A test that references something no longer there is a broken test, not a leftover.

**Why.** Found by `workflow-integrity-hardening` (findings 2 and 3, 2026-09-25): a component changed and the
tests, the e2e specs or the catalog that named it stayed behind, and the break only showed up later, in a
Playwright run or a review. The same gap reappears in every delegated assignment that removes or renames
something without being told to look for consumers (rule 12), and for a shared component the scope itself
(only here, or everywhere) was decided after the fact instead of asked before the contract (rule 11).

**How to apply.** Before removing or renaming a public surface, grep the whole repo for the old name and list
the hits in the contract or the assignment. Update each hit in the same change: component, tests, catalog,
standards. For a component under `app/components/shared/` or used from more than one parent, fill the
contract's `## Shared component consumers` section first: the grep result, and the user's answer, only here or
everywhere. A subagent brief that removes or renames something carries that grep as a mandatory line (rule 12).

**How it's checked.** `tests/arch/no-orphan-testids.spec.ts` fails when a test references a `data-testid` that no
component in `app/` renders (dynamic prefixes only through its documented allowlist);
`tests/arch/orphan-refs-docs.spec.ts` pins this rule, the rule 12 brief line and the contract and workflow text;
`tests/arch/docs-sync.spec.ts` covers the catalog (rule 07). Props, classes and i18n keys have no dedicated
orphan check today: the compiler, the typecheck, `tests/unit/i18n-parity.spec.ts` and human review cover them,
and that limit is stated rather than papered over (rule 19).
