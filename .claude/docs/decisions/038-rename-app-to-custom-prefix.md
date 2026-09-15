# 038 · Renom del prefix de primitius: App* → Custom*

**Decisió (D5 del handoff post-launch, reobre la 026).** Es renomena tota la família de primitius
`App{Text,Input,Link,Image,Button,Icon,Badge,Alert,Card,Section,Skeleton,Marquee}` a `Custom*`. Substitueix la
decisió 026 pel que fa al nom (no pel que fa al concepte: segueixen sent l'única porta d'entrada a elements
HTML natius de text/form/enllaç/imatge).
**Conseqüències.** Rename mecànic però ampli: fitxers de component, imports a totes les vistes, ESLint
(`vue/no-restricted-html-elements`, `no-restricted-class`), tests unitaris i d'arquitectura, catàleg
(`docs/catalog/components.md`) i qualsevol menció a `docs/standards/`. Es fa en un sol commit per evitar estats
intermedis inconsistents.
