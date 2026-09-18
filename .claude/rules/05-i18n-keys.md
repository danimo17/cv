# 05 · Every user-facing string is an i18n key

**What.** No visible string hardcoded in templates (`vue/no-bare-strings-in-template`). Every key exists in
`i18n/locales/{en,ca,es}.json` with the same structure. Keys: `<area>.<entity>.<field>` (see
`docs/standards/i18n.md`). Dates, URLs and proper names live in `app/data/cv/*.ts`, not in the JSON files.
**Why.** A missing key shows the raw key to the user: a broken screen.
**How it's checked.** ESLint + `tests/unit/i18n-parity.spec.ts`.
