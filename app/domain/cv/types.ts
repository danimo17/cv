export type Section = 'experience' | 'education' | 'certifications'

export interface TimelineItem {
  id: string
  section: Section
  org: string
  url?: string
  location?: string
  start: string
  end?: string | null
  tags: string[]
}

export interface StackGroup {
  id: string
  icon: string
  items: string[]
}
