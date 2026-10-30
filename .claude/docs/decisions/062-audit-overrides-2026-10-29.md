# 062 · Audit job: nine more dependency overrides (advisories of 2026-10-22 to 2026-10-29)

**Context.** After decision 061, new high advisories were published for transitives already in the lockfile. The CI
`audit` job (`pnpm audit --audit-level=high`, a required check on `main`) went red on `main`'s own lockfile and so
blocks PRs #23, #24, #25 and #28, none of which touch runtime dependencies. `pnpm audit` reported 40 findings
(7 low, 14 moderate, 19 high once per affected package and path, with the two ignores of decision 056 already
applied) from eleven high-severity advisories on eight packages. Same approach as decisions 056, 058 and 061 (rule 11: not asked again). Scope: task
`audit-overrides-3`, contract criteria 1-3.

**Decision.** In `pnpm-workspace.yaml`, nine more `overrides` raise the vulnerable transitives to their patched
floor. Each patched version was checked with `npm view <pkg> versions time` and was published more than 24 hours ago
(the youngest floor, `happy-dom@21.0.4`, on 2026-10-20), so `minimumReleaseAge: 1440` accepts it with no
`minimumReleaseAgeExclude` entry. Each selector is bounded to the vulnerable range so a future major is never forced:

- `zod@>=4.0.0 <4.6.6` to `^4.6.6` (high `GHSA-mrhx-c7xc-m3w5`, memory exhaustion validating oversized constrained
  collections; patched `>=4.6.6`, published 2026-10-11). Reached via `@nuxt/eslint > @eslint/config-inspector >
devframe > @modelcontextprotocol/server > @modelcontextprotocol/core` (dev-time). Resolves to `4.6.7`. The lower
  bound `4.0.0` keeps a hypothetical `zod` 3.x from being forced to 4.x; the tree holds no 3.x.
- `happy-dom@<21.0.4` to `^21.0.4` (high `GHSA-834v-8h66-3h79`, incomplete fix of CVE-2026-33943, vulnerable
  `>=17.0.0 <=21.0.3`, and high `GHSA-c8p4-j97h-3vg8`, SSRF via iframe and link stylesheet, vulnerable `<=20.14.6`;
  patched `>=21.0.4`, published 2026-10-20, there is no `20.14.7` on npm so the 21.x line is the only fix). Reached
  through the direct devDependency `happy-dom` and through `@nuxt/test-utils` and `vitest` (peer, the Nuxt vitest
  environment `domEnvironment: 'happy-dom'`). Resolves to `21.0.4`. The override rewrites the direct dependency's
  specifier in the lockfile to `^21.0.4` while `package.json` still says `^20.0.11`; `pnpm install --frozen-lockfile`
  accepts that and the unit suite passes on 21.0.4.
- `undici@>=8.0.0 <8.12.2` to `^8.12.2` (four high advisories: `GHSA-xjj6-f33q-929c` denial of service via an
  unhandled error on an excessive response, `GHSA-4w7w-5xrc-9h26` cache poisoning and cross-user disclosure,
  `GHSA-2m5v-pch6-74hx` TLS certificate validation bypass via dropped TLS options, `GHSA-qrxm-fqhp-jwvm` denial of
  service via a certificate-changing TLS 1.2 renegotiation; patched `>=8.12.2`, published 2026-10-15). Reached via
  `nuxt` (`^8.10.0`). Resolves to `8.12.3`.
- `undici@>=7.29.1 <7.30.1` to `^7.30.1` (the same four advisories on the 7.x line, vulnerable `>=7.0.0 <7.30.1`
  (one of them `>=7.18.0`); patched `>=7.30.1`, published 2026-10-15). Reached via `wrangler > miniflare`, which pins
  the exact version `7.29.1`. That exact pin is not inside the older `undici@>=7.0.0 <7.29.1` range of decision 056,
  which therefore never matched it; the new selector starts at `7.29.1` so the two ranges cover `>=7.0.0 <7.30.1`
  together without overlapping, and the older key stays untouched. Resolves to `7.30.1`.
- `seroval@<1.6.8` to `^1.6.8` (three high advisories in the `fromJSON` / `fromCrossJSON` deserializer:
  `GHSA-97r2-qh9m-474h` trusted array length, `GHSA-wp97-x4hv-qvhp` denial of service via unvalidated input,
  `GHSA-7rv5-mrxv-xcr9` attacker-chosen callables; vulnerable `<=1.6.7`, patched `>=1.6.8`, published 2026-09-29).
  Reached via `nuxt > @nuxt/vite-builder`. Resolves to `1.7.2` (a minor above the floor: `^1.6.8` accepts it and
  `1.7.3`, published 2026-10-28, is still younger than 24 hours).
- `@intlify/shared@>=11.1.10 <11.4.14`, `@intlify/core@>=11.1.10 <11.4.14`, `@intlify/core-base@>=11.1.10 <11.4.14`
  and `vue-i18n@>=11.1.10 <11.4.14`, each to `^11.4.14` (high `GHSA-83rm-6c8r-g728`, `escapeParameter` does not
  prevent XSS through `srcdoc` in translations; the advisory is reported once per package of the monorepo; patched
  `>=11.4.14`, published 2026-10-10). Reached via `@nuxtjs/i18n` and `@intlify/unplugin-vue-i18n`. All resolve to
  `11.4.16`, and `@intlify/devtools-types` and one `@intlify/message-compiler` move with them because the family
  pins its siblings exactly.

Every patched version exists on npm, so nothing is ignored and the two ignores of decision 056 are unchanged.
`pnpm audit --audit-level=high` now exits 0: "8 vulnerabilities found, 4 low | 3 moderate | 1 high (1 ignored)",
the remaining low and moderate findings (`nuxt`, `serialize-javascript`, `deepmerge`) are below the audit level and
out of scope here.

REMOVE-WHEN for every one of the nine overrides: the parent dependency that pulls it (`@nuxt/eslint` /
`@eslint/config-inspector` for `zod`, `@nuxt/test-utils` / `vitest` and the direct `happy-dom` devDependency for
`happy-dom`, `nuxt` for the 8.x `undici` and for `seroval`, `wrangler` / `miniflare` for the 7.x `undici`,
`@nuxtjs/i18n` / `@intlify/unplugin-vue-i18n` for the `@intlify` family and `vue-i18n`) ships a release whose own
lockfile resolution is already at or above the floor, then the override is deleted. For `happy-dom`, raising the
`package.json` specifier to `^21.0.4` is the equivalent clean-up.

**Consequences.**

- `tests/arch/audit-overrides.spec.ts` was strengthened: the lockfile must resolve `zod`, `happy-dom`, both `undici`
  lines, `seroval`, the three `@intlify` packages and `vue-i18n` only at or above their patched versions even if an
  override is later removed (the test that guarded decision 061's packages now covers decision 062's too). The generic
  checks (caret floor at or above the patched version, a decision quoting selector and value, nothing in the
  vulnerable range, a remove-when condition) cover the nine new keys.
- Risk: the `happy-dom` major bump (20.14.5 to 21.0.4) changes the DOM used by the Nuxt vitest environment, and the
  `undici` 7.x and 8.x bumps change the HTTP client of `nuxt` and `wrangler` (dev-time); covered by `pnpm gate:push`
  (unit suite, build and e2e).
