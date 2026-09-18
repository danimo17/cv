# 04 · No sensitive personal data

**What.** Neither the website nor the PDFs in `public/cv/` contain a phone number or postal address. Contact: email, GitHub, LinkedIn.
The PDFs are checked at the **text layer** (a phone number hidden visually but present in the text is indexed all the same).
**Why.** The site is public and indexable by bots.
**How it's checked.** `tests/arch/no-pii.spec.ts` (actual PDF text via `pdf-parse` + data sources) and the review checklist.
Before adding a PDF: extract its text (the PDF's Read tool or `mdls -name kMDItemTextContent`) and search it for numbers.
