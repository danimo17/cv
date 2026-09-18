# danimorales.dev — AI guide

Daniel Morales's personal CV website (frontend). Nuxt 4 + Tailwind v4 + Pinia + @nuxtjs/i18n (ca/es/en) + Giphy
meme picker, deployed to Cloudflare Workers. Repo `danimo17/cv`. Nothing in this project may contain code or
internal resources from any company; only public information.

## Binding rules (read ALWAYS)

@.claude/hard-rules.md

## Context map (read when about to write in that territory)

- Work workflow (story → contract → build → gate → review → validate → handoff → PR): `.claude/workflow.md`
- Active task: `.claude/tasks/ACTIVE` holds the slug → `.claude/tasks/<slug>/{story,contract,handoff}.md`.
  `handoff.md` carries the branch's real state and the **User pendings** list (remember it and ask about it again when appropriate).
- Decisions made (do NOT ask again about what's already there): `.claude/docs/decisions/`
- Standards (how each kind of thing is written): `.claude/docs/standards/{components,styling,code-style,state,i18n,testing}.md`
- Living catalog (what already exists, props, classes, tokens, keys): `.claude/docs/catalog/{components,styles,state,i18n,ai-workflow}.md`
  → updated IN THE SAME CHANGE that creates or modifies the artifact (rule 07, test `tests/arch/docs-sync.spec.ts`).
- Story backlog: `.claude/backlog.md`. Templates: `.claude/templates/`.

## Commands

`pnpm dev` · `pnpm gate` (format:check + lint + typecheck + test) · `pnpm gate:push` (gate + build + e2e) ·
`pnpm test:arch` · `pnpm lint:fix` · `pnpm format` · `pnpm cf:dev` · `pnpm cf:deploy`

## Structure

Layers (decision 029, one-directional dependency API → Service → Store → View → UI-config):
`server/api/giphy` + `server/utils` (API) · `app/services/<api>/` (Service) · `app/stores/` (Store) ·
`app/pages/` + `app/components/{shared,layout,cv,meme}/` (View; `shared/Custom*` are the primitives, decisions 026, 038) ·
`app/ui-config/<entity>/` (UI-config) · `app/domain/<entity>/` (types + pure rules) · `app/data/cv/` (tables) ·
`app/composables/` (framework helpers) · `app/types/ui.ts` · `app/plugins` · `app/assets/css/{tokens,base,pages,components/*}` ·
`shared/types` · `i18n/locales` · `tests/{unit,arch}` · `e2e/` · `.github/workflows` · `.claude/` (all AI context).
