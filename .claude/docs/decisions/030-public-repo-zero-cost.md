# 030 · Public repo and zero cost

**Context.** The user confirms that the `danimo17/cv` repo is public (the code is the point of the site) and requires that all tools and services be free.
**Decision.** Public repo. Binding restriction: no paid dependency, service, or action. Current stack, all free: Nuxt, Tailwind, Pinia, pnpm, Vitest, Playwright, gitleaks, Dependabot, GitHub Actions (unlimited on public repos), CodeQL (free on public repos), Cloudflare Workers (free plan), Giphy API. Only expense: the domain ($12.20/year, already paid). Keys and secrets are never queryable: rule 01 + gitleaks.
**Consequences.** If the repo ever went private, CodeQL would stop being free and would have to be removed from the workflow and the ruleset. Any future proposal of a paid service is asked about first (rule 11).
