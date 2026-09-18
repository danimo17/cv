# 039 · Pull Request conventions

**Context.** So far there's only been 1 PR (#1, "Feat/bootstrap") with GitHub's default title (capitalized
branch name) and an empty body — noise, not a deliberate convention. The user asked (2026-09-16) for a fixed
structure for all PRs from now on, for the AI to be the one opening them, and for the review (checklist +
`/code-review`) to happen right before opening them, not before the first commit as `workflow.md` said until
now. Decided via `/grill-me`.

**Decision.**

1. **Title:** short natural-language summary, in English, with no type or slug prefix (the slug is already in
   the `feat/<slug>` branch and in the PR footer). E.g.: `Add www domain, fix Dependabot, enable Web Analytics`.
2. **Body:** fixed sections, always in this order and in English:
   - `## Summary` — 2-4 bullets on what changes and why.
   - `## Acceptance criteria` — list of the contract's criteria (`.claude/tasks/<slug>/contract.md`), with
     ✅/⏳.
   - `## Review` — what was checked (compliance checklist + `/code-review`) and the result.
   - `## User pendings` — only if any remain (manual actions outside the AI's scope).
   - `## Test plan` — real output of `pnpm gate:push` (N tests, build, e2e).
3. **Language:** English (consistent with the commits, which already were; the repo is public). **Superseded
   the same day by rule 13**: the whole repo (including the rest of `.claude/`) becomes English, not just the
   PRs — see `docs/decisions/040-english-only.md` and the migration pending in the handoff.
4. **Who opens it:** the AI, with `gh pr create`, analyzing the real diff (not copying the handoff verbatim).
   The user remains the only one who merges (decision 031, unchanged).
5. **When:** the workflow's "Review" step (checklist + `/code-review`) moves to right before opening the PR
   (not before the first commit); if the review finds anything, it's fixed and `pnpm gate:push` is rerun
   before push/PR. `workflow.md` updated in the same change (rule 07).

**Consequences.** No automated test checks this (it's AI process, not code); it's reviewed handoff to handoff.
If examples were ever needed, the PR for this very task (`post-launch`) is the first to follow this
convention.
