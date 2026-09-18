# Story: Post-launch fixes (DNS, www, Dependabot, backlog)

**Slug:** `post-launch` · **Branch:** `feat/post-launch` (create it from this one) · **Status:** doing

As Daniel I want `danimorales.dev` and `www.danimorales.dev` to actually respond, the Dependabot pipeline to
stop failing, and to decide the open points (D1-D5) from the bootstrap, so I can say the site is "done" and
move on to the next iteration.

## Out of scope

- "Projects" section (dropped, decision 035).
- Generating real photo sizes (decision 037: `CustomImage` is only left ready for `srcset`/`sizes`).
- Enabling Cloudflare Web Analytics (decision 036: manual dashboard action, not code).

## External dependencies

- Cloudflare DNS propagation (outside our control, only wait/verify).
- User's access to the Cloudflare dashboard and GitHub (rule 06/031: only they push/merge).
