# 09 · Binding gates

**What.** `pnpm gate` (format:check, lint, typecheck, unit+arch) must be green before every commit;
`pnpm gate:push` (gate + build + e2e) before every push; CI (gate + build + e2e + security) green before
every merge to `main`; production deploy only comes from `main` and only if CI is green there. Never
`--no-verify` or `-n`. A test that's bothersome gets fixed or justified in the contract, not skipped.
**Why.** "I tested it" is not evidence; the gate is.
**How it's checked.** `.githooks/pre-commit`, `.githooks/pre-push` (enabled by `pnpm install` → `prepare`
script), workflows in `.github/workflows/`, `main` ruleset with required checks, and the Claude hook
`.claude/hooks/require-contract.sh` that blocks `--no-verify`.
