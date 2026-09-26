# 09 · Binding gates

**What.** `pnpm gate` (format:check, lint, typecheck, unit+arch) must be green before every commit;
`pnpm gate:push` (gate + build + e2e) before every push; CI (gate + build + e2e + security) green before
every merge to `main`; production deploy only comes from `main` and only if CI is green there. Never
`--no-verify` or `-n`. A test that's bothersome gets fixed or justified in the contract, not skipped.

Workflow step 8 (review-checklist + `/code-review` before opening the PR) is gated the same way, not just
written down: pushing a `feat/*` branch with an active task requires `.claude/tasks/<slug>/handoff.md`'s
`## Review` section to exist, have zero unchecked boxes, and mention `code-review` having run (push-review-
gate, decision 054). Hard block, no escape hatch — same as the rest of this rule.

**Why.** "I tested it" is not evidence; the gate is. Same logic extends to "I reviewed it" (decision 054,
rule 19): a workflow step enforced only by the AI remembering to follow it is not enforced.

**How it's checked.** `.githooks/pre-commit`, `.githooks/pre-push` (enabled by `pnpm install` → `prepare`
script), workflows in `.github/workflows/`, `main` ruleset with required checks, and the Claude hook
`.claude/hooks/require-contract.sh` that blocks `--no-verify` and (on push) an incomplete review.
