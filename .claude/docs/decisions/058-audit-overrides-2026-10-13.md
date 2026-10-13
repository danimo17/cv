# 058 · Audit job: four more dependency overrides (advisories of 2026-10-12/13) and a `simple-git` 4.x patch

**Context.** On 2026-10-12/13 new high and critical advisories were published for transitive dependencies already
in the lockfile. The CI `audit` job (`pnpm audit --audit-level=high`, a required check on `main`) went red on
`main`-based code and therefore on PR #19 and PR #20, which touch no runtime dependencies. The user decided
(rule 11, not asked again) to fix it inside `feat/close-workflow-redesign` (contract criteria 35-36), the same
way decision 056 did for the 2026-10-01/02 batch. 10 vulnerabilities were reported: 3 critical, 6 high (2 already
ignored by decision 056), 1 low.

**Decision.** In `pnpm-workspace.yaml`, next to the three overrides of decision 056, four more `overrides` raise
the vulnerable transitives to their patched floor. Each patched version was checked on npm (`npm view <pkg>
versions`, published more than 24 hours ago so `minimumReleaseAge: 1440` accepts it) and the selector is bounded
to the vulnerable range so a future major is never forced:

- `@simple-git/argv-parser@<2.0.1` to `^2.0.1` (critical `GHSA-v5rq-49vh-5v5c`, via `nuxt > @nuxt/devtools >
simple-git`). `simple-git@3.36.0` imports only `vulnerabilityCheck(args, env)` from it, which keeps the same
  signature in 2.0.1 (checked by calling it). Resolves to `2.0.1`.
- `shell-quote@>=1.8.4 <1.11.0` to `^1.11.0` (critical `GHSA-pqg4-j6r4-53mv`, via `@nuxt/devtools > launch-editor`).
  Resolves to `1.12.0`.
- `source-map-js@>=1.0.0 <1.2.2` to `^1.2.2` (high `GHSA-68fv-2mgg-jv7q`, via `vue > @vue/compiler-*` and the
  `@intlify` packages). Resolves to `1.2.2`.
- `sharp@<0.35.5` to `^0.35.5` (high `GHSA-wq5f-xc86-pv6w`, via `wrangler > miniflare`, dev-time only). Resolves
  to `0.35.5` plus the `@img/sharp-*` binaries it pins.

Each override is a pin on a transitive that Dependabot cannot bump directly. REMOVE-WHEN for every one of them:
the parent dependency (`nuxt`/`@nuxt/devtools`, `vue`, `@nuxtjs/i18n`, `wrangler`) ships a release whose own
lockfile resolution is already at or above the floor, then the override is deleted.

**Fixed with a patch: `simple-git`.** The last 3 findings are all `simple-git` via `nuxt > @nuxt/devtools`: critical
`GHSA-x6jw-m9v5-85vh` (`>=3.15.0 <4.0.1`, patched only in `4.0.1`) and high `GHSA-g4wm-2vf7-vfgr` and
`GHSA-858h-whjf-mvg5` (`<=3.36.0`, advisory says patched `3.36.1`, but `3.36.1` does not exist on npm: the
registry goes `3.36.0`, `4.0.0`, `4.0.1`, `4.0.2`). The only fix is the 4.x major. The user decided (rule 11) to fix
it for real, with no ignore. Two changes, which only work together:

- `simple-git@<4.0.1` to `^4.0.1` in `overrides` (resolves to `4.0.2`, which pins `@simple-git/argv-parser` `2.0.1`
  and `@simple-git/args-pathspec` `1.0.4`).
- `patchedDependencies`: `@nuxt/devtools@3.4.2` to `patches/@nuxt__devtools@3.4.2.patch`. `@nuxt/devtools@3.4.2`
  (the stable release, depended on by `nuxt@4.5.2` and `nuxt@4.6.1`) does `import Git from 'simple-git'` in
  `dist/chunks/module-main.mjs`; 4.x has no default export, so with the override alone `nuxt prepare` (the
  `postinstall` script) fails with "does not provide an export named 'default'". The patch is one line:
  `import { simpleGit as Git } from 'simple-git'`. Everything else devtools uses is the unchanged API of 4.x:
  `Git(rootDir)`, `.branch()`, `.revparse(['--short', 'HEAD'])` and `.status()` then `.isClean()` (only in
  `generateAnalyzeBuildName`, which falls back to a timestamp if git throws), plus a side-effect
  `import 'simple-git'` in `dist/chunks/vscode.mjs` that needs no change.

Why not a downgrade: every `@nuxt/devtools` from 1.7 to 3.4.2 depends on `simple-git@^3`, and every 3.x up to
`3.36.0` is inside the advisory ranges, so no older devtools can help (verified on npm). Why not an ignore: the user
chose a real fix; the three advisories are not in the Worker bundle (`@nuxt/devtools` is dev-time) but they stay
visible in the audit instead of being silenced. Why not `@nuxt/devtools@4.0.0-beta.5` (drops `simple-git`): a beta
major published 2026-10-13 with a large new dependency tree.

REMOVE-WHEN for the patch `patches/@nuxt__devtools@3.4.2.patch` (target `@nuxt/devtools@3.4.2`), its
`patchedDependencies` entry and the `simple-git@<4.0.1` override together: the
resolved `@nuxt/devtools` (through `nuxt`) is a stable release that itself depends on `simple-git` at or above
`4.0.1` (or no longer depends on it). Until then the arch test fails if the locked devtools version differs from
the patched `3.4.2`, so a Dependabot bump of `nuxt` or `@nuxt/devtools` forces this cleanup instead of silently
carrying a stale patch.

**Consequences.**

- `tests/arch/audit-overrides.spec.ts` keeps the file honest: every override value is a caret range whose floor
  is at least the exclusive upper bound of its selector, a decision quotes both the selector and the value,
  `pnpm-lock.yaml` resolves nothing inside any vulnerable range, and every `ignoreGhsas` entry sits in a decision
  entry naming its package and a remove-when condition.
- The arch test also checks that the lockfile resolves `simple-git` only at or above `4.0.1`, that every
  `patchedDependencies` entry points at an existing file under `patches/` whose target version is the one locked
  in `pnpm-lock.yaml` and which contains `simpleGit as Git`, that the patch and the `simple-git` override exist
  together, and that a decision names each patch with a remove-when condition.
- `pnpm audit --audit-level=high` exits 0: "3 vulnerabilities found, 1 low | 2 high (2 ignored)", only the two
  ignores of decision 056 remain.
- Risk: the git panel features of devtools (`generateAnalyzeBuildName`) were exercised from node, not from the
  devtools UI in a browser. The `@simple-git/argv-parser` override is now redundant (4.0.2 pins `2.0.1`) but is
  harmless and is removed with its parent per its own remove-when.
- The two ignores of decision 056 are unchanged.
