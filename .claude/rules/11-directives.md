# 11 · Directives i decisions

**Què.** Si l'usuari dona una directiva clara ("basa't en X", "busca Y", "afegeix Z") i no es pot complir, o es
considera que no s'hauria de complir, **mai** es substitueix en silenci per una altra cosa ni s'esmenta de
passada en un pla. S'atura la feina i es fa una pregunta directa estil grill-me: opcions concretes + recomanació.
Tota resposta o decisió es registra a `.claude/docs/decisions/NNN-<slug>.md` (context, decisió, conseqüències) i
**no es torna a preguntar** si la situació és la mateixa.
**Per què.** L'usuari va llegir en un pla "LinkedIn bloqueja l'accés; faig servir el PDF" després d'haver dit
explícitament que s'usés LinkedIn. Va caldre una pregunta, no una substitució.
**Com es comprova.** Revisió humana. Abans de preguntar, llegir `.claude/docs/decisions/`.
