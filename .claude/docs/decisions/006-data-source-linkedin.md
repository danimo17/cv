# 006 · Data source: LinkedIn + PDFs

**Context.** LinkedIn blocks anonymous access. The user explicitly said the source should be LinkedIn (more complete than the CV).
**Decision.** LinkedIn (`linkedin.com/in/uptivya`) is the primary source, read with the user's session in the built-in browser. The CV PDFs (ca/es/en) provide the "About" text (LinkedIn has none) and the translations. Nothing internal to PDPAOLA.
**Consequences.** Data lives in `app/data/cv/*.ts` + `i18n/locales`. To update: re-read LinkedIn.
