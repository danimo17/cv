# Contract: Fix Cloudflare deploy failing on secrets upload

**Story:** `story.md` · **Declared data sources (rule 02):** none (CI/deploy config only, no CV content)

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                        | Test that covers it                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Given the `deploy` workflow, When it runs on a successful `ci` run on `main`, Then it deploys the Worker first (no `secrets:` on that step) and only then uploads `NUXT_GIPHY_API_KEY` in a separate step. | Manual: next merge to `main` deploys green; human review of `deploy.yml` diff |
| 2   | Given the secrets-upload step fails, When the workflow runs, Then the deploy step itself has already published the new Worker version (secrets failure doesn't roll back or block the app going live).     | Human review of step ordering in `deploy.yml`                                 |

## Subagent assignments (rule 12)

None — single-file, few-line change to `.github/workflows/deploy.yml`; falls under the "trivial
change" exception (rule 12).

## Standards to consult

- `.claude/docs/catalog/ai-workflow.md` (deploy workflow is documented there — update in same commit, rule 07)

## Open questions (each with a destination)

- Was there a stray/undeployed Worker version in the Cloudflare dashboard causing the original
  10215? → owner: Daniel (user), check dashboard; the reorder fix is correct regardless since it's
  Cloudflare's own recommended remediation and prevents future recurrence.
