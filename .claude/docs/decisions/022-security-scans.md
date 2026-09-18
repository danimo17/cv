# 022 · Security scans in CI

**Decision.** `security.yml`: gitleaks (secrets in the repo), `pnpm audit --audit-level=high`, CodeQL (JavaScript/TypeScript). `dependabot.yml`: weekly npm and GitHub Actions deps. All are required checks to merge into `main`, alongside `ci` (gate + build + e2e).
**Consequences.** CodeQL is free only on public repos; if the repo goes private it must be disabled or GitHub Advanced Security paid for.
