# Story: Fix Cloudflare deploy failing on secrets upload

**Slug:** `deploy-secrets-order` · **Branch:** `feat/deploy-secrets-order` · **Status:** doing

As the site owner I want the `deploy` workflow to actually publish to Cloudflare Workers after CI
passes, so that merges to `main` reach production instead of silently failing at the secrets step.

## Context

PR #2 merged into `main` on 2026-09-18; `ci` and `security` passed, but the `deploy` workflow run
(35376833951) failed at "Deploy to Cloudflare Workers" with Cloudflare API error `10215`:
`wrangler-action` uploads secrets (`NUXT_GIPHY_API_KEY`) before running `wrangler deploy`, and
Cloudflare rejects a secret edit when the account's latest Worker version isn't the one currently
deployed. Site is still serving whatever was deployed on 2026-09-14 (run 34898981422).

## Out of scope

- Investigating/cleaning up any stray Worker version in the Cloudflare dashboard (user to check
  separately if the reordering below doesn't resolve it).
- Migrating to the Worker Versions secrets API (`wrangler versions secret put`) — the two-step
  reorder is the smaller fix and matches Cloudflare's own suggested remediation.

## External dependencies

- Cloudflare Workers (`cv` Worker), GitHub Actions `production` environment secrets.
