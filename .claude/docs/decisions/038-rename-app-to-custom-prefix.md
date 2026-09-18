# 038 · Primitives prefix rename: App* → Custom*

**Decision (D5 of the post-launch handoff, reopens 026).** The whole primitives family
`App{Text,Input,Link,Image,Button,Icon,Badge,Alert,Card,Section,Skeleton,Marquee}` is renamed to `Custom*`.
Supersedes decision 026 on naming (not on the concept: they remain the sole entry point to native
text/form/link/image HTML elements).
**Consequences.** A mechanical but wide-reaching rename: component files, imports across all views, ESLint
(`vue/no-restricted-html-elements`, `no-restricted-class`), unit and architecture tests, catalog
(`docs/catalog/components.md`), and any mention in `docs/standards/`. Done in a single commit to avoid
inconsistent intermediate states.
