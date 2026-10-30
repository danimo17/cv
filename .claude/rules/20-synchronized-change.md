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

**How it's checked.** `tests/arch/no-orphan-testids.spec.ts` is the only mechanical check of the synchronized
change: every `data-testid` referenced by an e2e file (`e2e/**/*.ts`: specs, helpers, page objects and fixtures)
or a unit test file (`tests/unit/**`) must be rendered by a component in `app/` (or be supplied by that same
test file, as in an `attrs` object or a stub template); what the scan cannot resolve to a literal goes through
an allowlist entry with a reason. It covers the test to component direction only, so a component id that no
test uses is not flagged. `tests/arch/orphan-refs-docs.spec.ts` pins the text of this rule, of the rule 12
brief line and of the contract and workflow wording; `tests/arch/docs-sync.spec.ts` checks that an artifact
has a catalog block (rule 07), not that a rename updated the references to it.

Not mechanical: props, CSS classes, i18n keys (apart from the key parity of `tests/unit/i18n-parity.spec.ts`),
store, composable and route names, and every reference to a renamed or removed thing in the catalog and in
`.claude/docs/`. The typecheck, the compiler and human review cover them in part, and that limit is stated
rather than papered over (rule 19). The `## Shared component consumers` section of the contract is enforced
at commit time by the check of the `hook-hardening` task in `require-contract.py`, not by anything in this
task.
