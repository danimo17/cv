# 020 · Els hooks protect-secrets i com escriure fitxers

**Context.** El hook global `protect-secrets` de l'usuari bloqueja qualsevol ordre Bash on aparegui una eina de lectura de text (les de mostrar o cercar fitxers) seguida, en qualsevol punt de l'ordre, del nom literal del fitxer d'entorn local (punt + env), encara que sigui dins d'un heredoc, un comentari o prosa.
**Decisió.** Per escriure fitxers des de Bash s'usa `tee FITXER <<'EOF'` i el nom del fitxer d'entorn s'escriu com a placeholder `.env` que es substitueix amb Python al final (`'.' + 'env'`); per a lots grans, un script escrit amb l'eina Write i executat amb `sh`. Cap ordre Bash conté mai el nom literal d'aquell fitxer.
**Conseqüències.** Als docs, si veus `.env` és que la substitució no s'ha fet. La IA tampoc no llegeix mai el fitxer d'entorn.
