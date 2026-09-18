# 036 · Analytics: Cloudflare Web Analytics, Automatic Setup

**Decision (D3 of the post-launch handoff).** Cloudflare Web Analytics is enabled. It complies with decision
030 (zero cost) and doesn't use cookies. The Cloudflare dashboard's **Automatic Setup** mode is used
(Analytics & Logs → Web Analytics → add zone `danimorales.dev`, without "Manual Setup"): it injects the beacon
at the edge level for all of the zone's HTML traffic, without touching code or adding any script to the repo.
**Consequences.** Manual action in the Cloudflare dashboard (outside the AI's scope, like `www`'s DNS).
Nothing in `app/` or `nuxt.config.ts`.

**Done.** Zone `danimorales.dev` added with Automatic Setup (2026-09-16); real data already coming in (verified
via dashboard screenshot: 14 page views / 5 visits in the last 24h).
