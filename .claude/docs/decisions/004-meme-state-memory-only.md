# 004 · El meme escollit NO sobreviu a la recàrrega

**Decisió.** L'estat del meme viu només a Pinia (memòria). Sobreviu a la navegació amb el router; una recàrrega restaura la foto. És deliberat: demostra estat client.
**Conseqüències.** Cap persistència a la store `hero`. No tornar a proposar localStorage per a això.
