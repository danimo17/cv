# 064 · Audit job: `node-forge` and friends, a `nuxt` 4.6.3 bump, and the end of the devtools patch (advisories of 2026-10-27 to 2026-10-31)

**Context.** After decision 062, five high `node-forge` advisories (`GHSA-7wch-p9px-956x`, `GHSA-jc66-7q78-782g`,
`GHSA-8hrf-8g6f-7xwp`, `GHSA-hqq3-7jhf-c5jx`, `GHSA-5x38-2vff-x55p`; vulnerable `<=1.4.0`, patched `>=1.4.1`) turned the
required `audit` check (`pnpm audit --audit-level=high`) red on `main`'s own lockfile again. `pnpm audit` reported 22
findings (7 low, 9 moderate, 6 high with 1 ignored); the only high ones are the five on `node-forge`, reached via
`nuxt > @nuxt/cli > listhen` and `nuxt > @nuxt/nitro-server > nitropack > listhen`. The weekly auto-fix run of
decision 063 (issue #31) proposed eleven overrides and failed its install on `deepmerge@^4.3.2`. Same approach as
decisions 056, 058, 061 and 062 (rule 11: not asked again). Scope: task `audit-overrides-4`, contract criteria 1-4.

**Decision.**

1. Three `overrides` in `pnpm-workspace.yaml` raise the vulnerable transitives to their patched floor. Each patched
   version was checked with `npm view <pkg> time` and was published more than 24 hours before 2026-10-31 14:14 UTC, so
   `minimumReleaseAge: 1440` accepts it with no `minimumReleaseAgeExclude` entry (the auto-fix run proposed eight such
   entries; none is needed). Each selector is bounded to the vulnerable range:
   - `node-forge@<=1.4.0` to `^1.4.1` (the five high advisories above plus three moderate and three low ones from the
     same release; patched `>=1.4.1`, published 2026-10-27; `1.4.2`, also 2026-10-27, is the newest and is what the
     lockfile resolves). Reached via `listhen`. The vulnerable range is closed with `<=` because the patched version is
     the first one above the last vulnerable `1.4.0`.
   - `serialize-javascript@<7.1.3` to `^7.1.3` (low `GHSA-gfhx-hw2g-v5hg` and `GHSA-m5mm-p8h7-m29v`, cross-site
     scripting; patched `>=7.1.3`, published 2026-10-22). Reached via `nitropack > @rollup/plugin-terser`. Resolves to
     `7.1.4`. This one replaces the two selectors the auto-fix proposed (`<7.1.3` and `>=7.1.1 <7.1.2`): the first
     already covers the second.
   - `glob@>=9.0.0 <14.0.2` to `^14.0.2` (moderate `GHSA-3g3m-2fjr-6pw4`, `AbortSignal` cancellation bypass; patched
     `>=14.0.2`, published 2026-10-27). Reached via `@vercel/nft`, `archiver-utils` and `js-beautify` (through
     `@vue/test-utils` and `@nuxt/test-utils`). Resolves to `14.0.3`. This is a major jump for the `glob@10.5.0` and
     `glob@13.0.6` consumers; the lockfile now holds a single `glob`, and `pnpm gate:push` (unit and arch tests, build
     and e2e) passes on it.
2. `nuxt` is raised in `package.json` from `^4.5.2` to `^4.6.3` instead of overriding it (auto-fix proposed `nuxt`,
   `@nuxt/nitro-server` and `@nuxt/vite-builder` overrides). `nuxt` pins its siblings exactly, so one bump moves
   `@nuxt/nitro-server` and `@nuxt/vite-builder` to `4.6.3` and `@nuxt/devtools` to `3.4.4`, clearing the moderate
   `GHSA-vjh5-4x84-xrqp` (route rules, `nuxt` and `@nuxt/nitro-server` `<4.6.2`), `GHSA-xfq5-w38q-pc2x` (server islands
   `useHeadSafe`, `<4.6.2`), `GHSA-648h-gw55-m2g7` (dev server exposes private runtime config, `@nuxt/vite-builder`
   `<4.6.3`) and the low `GHSA-jjm6-p2m9-9w4x` (`nuxt` `<4.6.0`). `4.6.3` was published on 2026-10-27. `nuxt` 4.6.3
   depends on `vue` `^3.5.44`, so `vue` is raised in `package.json` from `^3.5.43` to `^3.5.44` (published 2026-10-13) too:
   with the old specifier the lockfile held two `vue` copies (3.5.43 and 3.5.44), the Nuxt auto-import types augmented
   only one of them and `nuxt typecheck` failed with ~19 "Property 'profile' does not exist" errors on the templates.
3. The `@nuxt/devtools@3.4.2` patch of decision 058 (`patches/@nuxt__devtools@3.4.2.patch`, `patchedDependencies`) and
   the two overrides tied to it, `simple-git@<4.0.1` and `@simple-git/argv-parser@<2.0.1`, are removed. `@nuxt/devtools`
   `3.4.4` (what `nuxt` 4.6.3 depends on) no longer depends on `simple-git`, so the lockfile resolves neither package;
   the patch would otherwise make `pnpm install` fail with `ERR_PNPM_UNUSED_PATCH`. This meets the remove-when
   condition recorded in decision 058 (devtools ships a release that no longer needs the patch).
4. **Not fixable by an override: `minimatch`.** Moderate `GHSA-g3hv-75wg-m249` (denial of service through crafted
   patterns, vulnerable `<11.0.1`, patched `>=11.0.1`, 103 paths) was tried as `minimatch@<11.0.1` to `^11.0.1` and
   reverted: `pnpm lint` crashes at startup because `eslint-plugin-import-x` (via `@nuxt/eslint-config`) runs
   `import { makeRe } from 'minimatch'` and `minimatch` 11 no longer exports `makeRe` ("The requested module
   'minimatch' does not provide an export named 'makeRe'"). The 5.x and 10.x lines the lockfile keeps have no patched
   release, so the finding stays open. It is moderate (below the `high` threshold of the CI check) and **not ignored**.
   Remove-when for the open finding: `eslint-plugin-import-x` (or `@nuxt/eslint-config`) ships a release that imports
   `minimatch` 11 compatibly, after which the override can be added.
5. **Not fixable: `deepmerge`.** Low `GHSA-gcqx-w48m-w2h4` (`mergeObject()` prototype poisoning, vulnerable
   `>=4.2.0 <=4.3.1`, patched `>=4.3.2`) via `nitropack > @rollup/plugin-node-resolve`. No `4.3.2` exists on npm (the
   latest is `4.3.1`), so the override proposed by auto-fix cannot install and none is added. It is **not ignored** (no
   `ignoreGhsas` entry: that needs the user's explicit approval, rule 11) and does not matter to the check, because
   `--audit-level=high` ignores low findings. `pnpm audit --audit-level=high` therefore exits 0 with "1 vulnerabilities
   found, Severity: 1 low".

REMOVE-WHEN for every override: `node-forge@<=1.4.0` when `listhen` (via `nitropack` and `@nuxt/cli`) declares a
`node-forge` range whose floor is `1.4.1` or above; `serialize-javascript@<7.1.3` when `@rollup/plugin-terser` (via
`nitropack`) does the same for `7.1.3`; `glob@>=9.0.0 <14.0.2` when `@vercel/nft`, `archiver-utils` and `js-beautify`
all declare `glob` `14.0.2` or above. In each case the override is deleted once a lockfile regenerated without it
resolves only patched versions.

**Consequences.**

- `tests/arch/audit-overrides.spec.ts` was strengthened: the lockfile must resolve `node-forge`,
  `serialize-javascript`, `glob`, `nuxt`, `@nuxt/nitro-server` and `@nuxt/vite-builder` only at or above
  their patched versions even if an override is later removed; the `simple-git` check no longer requires `simple-git`
  to be present (it is gone, and a return below `4.0.1` still fails); a file under `patches/` that no
  `patchedDependencies` entry references now fails (an orphan patch file); the lockfile must resolve a single `vue`.
- Risk: `glob` 10/13 to 14 is a major jump for dev-time tooling (`@vercel/nft` during the Nitro build,
  `js-beautify`); `nuxt` 4.5.2 to 4.6.3 is a minor bump of the framework itself.
  All are covered by `pnpm gate:push` (lint, typecheck, unit and arch tests, `nuxt build`, Playwright e2e). Not covered:
  `wrangler`/`pnpm cf:deploy`, which only runs in the deploy workflow.
