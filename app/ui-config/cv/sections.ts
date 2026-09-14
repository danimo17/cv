// Configuració declarativa de les seccions de la home (capa UI-config, decisió 029).
// `pages/index.vue` en llegeix l'ordre; cada secció llegeix la seva entrada amb `getSectionConfig`.
export type HomeSectionId = 'about' | 'experience' | 'stack' | 'education' | 'contact'

export interface HomeSectionConfig {
  id: HomeSectionId
  /** Nom del component de `app/components/cv/` que la renderitza */
  component:
    'AboutSection' | 'ExperienceSection' | 'TechStack' | 'EducationSection' | 'ContactSection'
  /** Icona (registrada a `plugins/fontawesome.ts`) de l'eyebrow */
  icon: string
  titleKey: string
  eyebrowKey: string
}

export const homeSections: readonly HomeSectionConfig[] = [
  {
    id: 'about',
    component: 'AboutSection',
    icon: 'user',
    titleKey: 'about.title',
    eyebrowKey: 'about.eyebrow',
  },
  {
    id: 'experience',
    component: 'ExperienceSection',
    icon: 'briefcase',
    titleKey: 'experience.title',
    eyebrowKey: 'experience.eyebrow',
  },
  {
    id: 'stack',
    component: 'TechStack',
    icon: 'code',
    titleKey: 'stack.title',
    eyebrowKey: 'stack.eyebrow',
  },
  {
    id: 'education',
    component: 'EducationSection',
    icon: 'graduation-cap',
    titleKey: 'education.title',
    eyebrowKey: 'education.eyebrow',
  },
  {
    id: 'contact',
    component: 'ContactSection',
    icon: 'envelope',
    titleKey: 'contact.title',
    eyebrowKey: 'contact.eyebrow',
  },
]

export function getSectionConfig(id: HomeSectionId): HomeSectionConfig {
  const config = homeSections.find((section) => section.id === id)
  if (!config) throw new Error(`Unknown home section: ${id}`)
  return config
}
