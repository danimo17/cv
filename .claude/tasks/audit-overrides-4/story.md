# Story: audit-overrides-4

**Slug:** `audit-overrides-4` · **Branch:** `feat/audit-overrides-4` · **Status:** doing

As the repo owner I want the red CI `audit` job fixed a fourth time: five high `node-forge` advisories (`<=1.4.0`, via
`nuxt > @nuxt/cli > listhen` and `nuxt > @nuxt/nitro-server > nitropack > listhen`) fail `pnpm audit --audit-level=high`
on `main`'s own lockfile. The weekly audit-fix run (issue #31) also proposed fixes for the moderate and low findings
(`nuxt`, `@nuxt/nitro-server`, `@nuxt/vite-builder`, `glob`, `minimatch`, `serialize-javascript`) and failed on
`deepmerge@^4.3.2`, which does not exist on npm; those are cleared here too when they pass the full gate.

## Out of scope

- Ignoring an advisory without a patched version (`deepmerge`, `GHSA-gcqx-w48m-w2h4`, low): needs the user's explicit
  approval (rule 11); it is reported, not ignored.
- Changing how the audit job or the auto-fix workflow works.

## External dependencies

None. Runs in its own worktree (`cv-worktrees/audit-overrides-4`).
