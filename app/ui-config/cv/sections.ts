export type HomeSectionId = 'about' | 'experience' | 'stack' | 'education' | 'contact'

export interface HomeSectionConfig {
  id: HomeSectionId
  component:
    'AboutSection' | 'ExperienceSection' | 'TechStack' | 'EducationSection' | 'ContactSection'
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
