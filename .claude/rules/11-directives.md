# 11 · Directives and decisions

**What.** If the user gives a clear directive ("base it on X", "look for Y", "add Z") and it can't be
fulfilled, or it's judged that it shouldn't be fulfilled, it is **never** silently replaced with something
else nor mentioned in passing in a plan. Work stops and a direct grill-me style question is asked: concrete
options + a recommendation.
Every answer or decision is logged in `.claude/docs/decisions/NNN-<slug>.md` (context, decision, consequences) and
**is not asked again** if the situation is the same.
**Why.** The user read in a plan "LinkedIn blocks access; using the PDF instead" after having explicitly said
to use LinkedIn. A question was needed, not a substitution.
**How it's checked.** Human review. Before asking, read `.claude/docs/decisions/`. The mechanical slice:
`require-contract.py` blocks a commit that stages structural config (`nuxt.config.ts`, `eslint.config.mjs`,
`playwright.config.ts`, `vitest.config.ts`, `wrangler.jsonc`, `pnpm-workspace.yaml`, `package.json` dependency
keys, `.github/workflows/*`, `.githooks/*`, `.claude/hooks/*`, `.claude/hard-rules.md`, `.claude/rules/*.md`)
without a decision file under `.claude/docs/decisions/` in the same commit (decisions 041 and 059).
