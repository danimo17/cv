# 04 · Cap dada personal sensible

**Què.** A la web i als PDFs de `public/cv/` no hi ha telèfon ni adreça postal. Contacte: email, GitHub, LinkedIn.
Els PDFs es comproven a la **capa de text** (un telèfon amagat visualment però present al text s'indexa igual).
**Per què.** El lloc és públic i indexable per bots.
**Com es comprova.** `tests/arch/no-pii.spec.ts` (text real dels PDFs via `pdf-parse` + fonts de dades) i review checklist.
Abans d'afegir un PDF: extreure'n el text (eina Read del PDF o `mdls -name kMDItemTextContent`) i buscar-hi números.
