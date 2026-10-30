# 13 · Everything in English

**What.** Every artifact in the repo is written in English: code, comments, file names, `.claude/`
documentation (hard-rules, workflow, rules, decisions, standards, catalog, contracts, story, handoff),
`CLAUDE.md`, commit messages and PR title/body (decision 039). **Only exception:** the natural content of
`i18n/locales/{ca,es,en}.json` — the actual CV translations in the 3 languages — which is precisely the
reason those files exist.
**Why.** The repo is public (decision 030); English is the de facto standard for open source and is
consistent with the commits, which already were in English.
**How it's checked.** `tests/arch/language.spec.ts` scans every tracked text file outside `i18n/locales/` (`.claude/`
docs, workflows, hooks and tests included) for Catalan/Spanish letters, words and function-word runs. It is a
heuristic: a false positive goes into the spec's whole-file allowlist with its reason inline (proper names, CV data
tables), never into a weakened heuristic. Wording that is English but unusual is still a human-review matter.
