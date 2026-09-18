# 031 · Write access to the repo: user only

**Context.** The repo is public (030) but only the user can write to it.
**Decision.** No collaborators on GitHub. Only the user does `push` and `merge`. The AI can make local commits on `feat/<slug>` branches (rule 06) but never push. External PRs (forks) are possible but only the user can merge them; workflows on PRs from forks don't receive secrets (GitHub doesn't expose them), so preview and deploy don't run for third parties. The `main` ruleset (024) requires PR + checks and blocks force-push and deletion.
**Consequences.** A handoff always ends with: branch ready, gate green, and it's the user who runs `git push` and opens the PR. Rule 06 updated.

**Exception (2026-09-14).** The user can explicitly ask the AI to `git push` a `feat/*` branch (never `main`). The merge remains the user's alone.
