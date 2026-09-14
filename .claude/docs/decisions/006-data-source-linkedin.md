# 006 · Font de dades: LinkedIn + PDFs

**Context.** LinkedIn bloqueja l'accés anònim. L'usuari va dir explícitament que la font fos LinkedIn (més completa que el CV).
**Decisió.** LinkedIn (`linkedin.com/in/uptivya`) és la font principal, llegit amb la sessió de l'usuari al navegador integrat. Els PDFs del CV (ca/es/en) aporten el text 'About' (LinkedIn no en té) i les traduccions. Res intern de PDPAOLA.
**Conseqüències.** Les dades viuen a `app/data/cv/*.ts` + `i18n/locales`. Per actualitzar: tornar a llegir LinkedIn.
