# 09 · Gates vinculants

**Què.** `pnpm gate` (format:check, lint, typecheck, unit+arch) ha d'estar en verd abans de cada commit;
`pnpm gate:push` (gate + build + e2e) abans de cada push; la CI (gate + build + e2e + seguretat) en verd abans
de cada merge a `main`; el deploy a producció només surt de `main` i només si la CI hi és verda. Mai
`--no-verify` ni `-n`. Un test que molesta es corregeix o es justifica al contracte, no s'omet.
**Per què.** "He provat" no és evidència; la gate sí.
**Com es comprova.** `.githooks/pre-commit`, `.githooks/pre-push` (activats per `pnpm install` → script
`prepare`), workflows de `.github/workflows/`, ruleset de `main` amb checks obligatoris, i el hook de Claude
`.claude/hooks/require-contract.sh` que bloqueja `--no-verify`.
