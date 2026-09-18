# 13 · Everything in English

**What.** Every artifact in the repo is written in English: code, comments, file names, `.claude/`
documentation (hard-rules, workflow, rules, decisions, standards, catalog, contracts, story, handoff),
`CLAUDE.md`, commit messages and PR title/body (decision 039). **Only exception:** the natural content of
`i18n/locales/{ca,es,en}.json` — the actual CV translations in the 3 languages — which is precisely the
reason those files exist.
**Why.** The repo is public (decision 030); English is the de facto standard for open source and is
consistent with the commits, which already were in English.
**How it's checked.** Human review; existing migration inventoried and pending in `docs/decisions/040-english-only.md`
(explicit debt, not retroactive all at once). Consider a `tests/arch/language.spec.ts` test that would block
Catalan characters outside `i18n/locales/` once the migration is done.
