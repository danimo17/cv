# 056 · Audit job: three dependency overrides, two ignored advisories with no upstream fix

**Context.** On 2026-10-01/02 new high-severity advisories were published for transitive dependencies already in
the lockfile (`brace-expansion`, `devalue`, `undici`, `node-forge`, `braces`). The CI `audit` job
(`pnpm audit --audit-level=high` in `.github/workflows/security.yml`, a required check on `main`) went red on
`main`-based code and therefore on PR #16, which touches no dependencies. The user decided (rule 11, not asked
again) to fix it inside `feat/spacing-tokens` instead of a separate PR (contract criterion 6).

**Decision.** In `pnpm-workspace.yaml` (where this repo already keeps its pnpm settings: `allowBuilds`,
`minimumReleaseAge`):

- `overrides` force the patched versions of the three advisories that do have a fix:
  `brace-expansion@>=2.0.0 <2.1.6` to `^2.1.6`, `devalue@<5.9.3` to `^5.9.3`, `undici@>=7.0.0 <7.29.1` to
  `^7.29.1`. The selectors are bounded to the vulnerable ranges so a future major is never forced down or up.
  The lockfile resolved them to `brace-expansion@2.1.7`, `devalue@5.9.4`, `undici@7.30.0`; nothing else moved.
- `auditConfig.ignoreGhsas` lists the two advisories that have **no patched version on npm** (verified
  2026-10-04: `npm view node-forge` latest is `1.4.0` from 2026-03-24, `npm view braces` latest is `3.0.3` from
  2024-05-21, both inside the vulnerable ranges), so no override can fix them:
  - `GHSA-86w9-cpqp-85rv`: `node-forge` `<=1.4.0`, reached only via `listhen`, the Nuxt dev server / CLI
    (`nuxt > @nuxt/cli > listhen`, `nitropack > listhen`). Dev-time only, never part of the Worker bundle.
    REMOVE-WHEN: `node-forge` publishes `>=1.4.1`, or Nuxt/Nitro drop `listhen`.
  - `GHSA-vfj7-8cjw-p6xm`: `braces` `<=3.0.3`, reached only via build-time globbing (`micromatch`/`fast-glob`/
    `globby` in `nitropack` and `@intlify/unplugin-vue-i18n`) over this repo's own fixed patterns, never over
    user input and never at runtime. REMOVE-WHEN: `braces` publishes `>=3.0.4`, or those packages stop
    depending on it.

**Consequences.**

- The two ignores weaken the security gate: until removed, those two advisories cannot turn `audit` red. Each
  must be re-evaluated on every `pnpm audit` run that shows them as no longer unfixable, and the ignore deleted
  when its REMOVE-WHEN holds (the override then becomes unnecessary too, if the fix arrives transitively).
- The `audit` job still fails on any new high or critical advisory: only the two listed GHSA ids are exempt.
- The three overrides are pins on transitives that Dependabot cannot bump directly; once the parent packages
  (`nuxt`, `@nuxtjs/i18n`, their `minimatch`/`brace-expansion` chain) require the patched ranges themselves,
  the overrides are redundant and can be dropped.
- The remaining `low` advisory is below the `--audit-level=high` threshold and is not addressed here.
