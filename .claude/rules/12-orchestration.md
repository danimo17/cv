# 12 · El fil principal orquestra, els subagents executen

**Què.** La IA principal es manté lliure per a: parlar amb l'usuari, escriure i validar contractes, prendre i
registrar decisions, sintetitzar resultats i córrer les gates. Tot el que és **investigació** (llegir molts
fitxers, buscar patrons, verificar contractes externs) i **desenvolupament** (escriure o modificar codi, tests,
docs de catàleg) es delega a subagents (eina `Agent`), en paral·lel quan les peces són independents.
Cada subagent rep un encàrrec autocontingut: rutes, regles que apliquen (01, 05, 07, 08), estàndards a llegir,
criteris del contracte que cobreix, i què ha de retornar (fitxers escrits, pendents, dubtes).
Excepcions: canvis trivials (un fitxer, poques línies), replicar contingut ja redactat al fil principal, i les
correccions ràpides durant l'iterate loop amb l'usuari.
**Per què.** El context del fil principal és el recurs escàs: gastat en exploració, la sessió s'acaba abans.
L'usuari ho ha demanat explícitament.
**Com es comprova.** Revisió humana; el handoff llista quins subagents han fet què.
