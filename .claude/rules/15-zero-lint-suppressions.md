# 15 · Zero lint/typecheck suppressions

**What.** No `// eslint-disable*`, `// @ts-expect-error` or `// @ts-ignore` anywhere in the repo. A real
ESLint/TypeScript complaint gets a real code fix, never a silenced line. If no code fix can make a rule
literally pass for a legitimate reason (e.g. a generic type with no valid literal default), the rule's
configured severity for that case stays a warning — never an inline disable — and the reasoning is written up
in a decision under `.claude/docs/decisions/`, not as a comment in the code (rule 14 forbids that anyway).
**Why.** A disable comment hides an open problem behind green output; the user wants every open issue visible
and fixed, not masked.
**How it's checked.** `pnpm gate` (`eslint .`) must be green, and `tests/arch/no-lint-suppressions.spec.ts` fails
on `eslint-disable`/`eslint-enable`/`@ts-expect-error`/`@ts-ignore`/`@ts-nocheck` in any tracked file outside
`tests/`, `e2e/` and `.claude/` (decision 041).
