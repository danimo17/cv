# Standard · Tests

| Layer         | Tool                           | Covers                                                                                                              | Where                            |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Unit          | Vitest (`nuxt` env, happy-dom) | pure utils, `server/utils`, stores, composables (with `registerEndpoint`), components with logic (`mountSuspended`) | `tests/unit/**`                  |
| Architecture  | Vitest (`node` env)            | invariants no linter expresses: boundaries, secrets, docs-sync, css-per-component, PII                              | `tests/arch/**`                  |
| E2E           | Playwright (chromium)          | the critical meme → home flow, theme, language, server route validation. `/api/giphy/**` mocked with `page.route`   | `e2e/**`                         |
| Security (CI) | gitleaks, pnpm audit, CodeQL   | secrets in the repo, vulnerable deps, insecure patterns                                                             | `.github/workflows/security.yml` |

- One contract criterion = one named test. A fix requested by a human = a test that fails if it is undone.
- Tests never know the real Giphy key. Server utils are tested in isolation; the handler via e2e (400 without a key).
- The actual output is reported (`N passed`), along with what the suite does **not** cover.
- `// @vitest-environment node` on tests that don't need Nuxt (architecture, pure utils): faster.
- Git isolation: `tests/setup/clean-git-env.ts` (a `setupFiles` entry of `vitest.config.ts`) deletes the `GIT_*`
  variables git sets for its hooks (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`,
  `GIT_COMMON_DIR`, `GIT_PREFIX`) before any spec runs, so a spec that builds a scratch repository in a temp dir never
  writes into the real one when the suite runs from the pre-commit hook (worktree pollution incident of 2026-10-19).
  `tests/arch/test-env-isolation.spec.ts` fails if one leaks through. A new spec that spawns git needs no extra setup.
