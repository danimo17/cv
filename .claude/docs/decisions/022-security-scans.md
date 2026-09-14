# 022 · Escanejos de seguretat a la CI

**Decisió.** `security.yml`: gitleaks (secrets al repo), `pnpm audit --audit-level=high`, CodeQL (JavaScript/TypeScript). `dependabot.yml`: deps npm i GitHub Actions setmanals. Tots són checks obligatoris per fer merge a `main` juntament amb `ci` (gate + build + e2e).
**Conseqüències.** CodeQL és gratuït només en repos públics; si el repo és privat cal desactivar-lo o pagar GitHub Advanced Security.
