// Tipus del domini CV (sense framework). Decisió 029.
export type Section = 'experience' | 'education' | 'certifications'

export interface TimelineItem {
  /** Clau i18n: `<section>.items.<id>` */
  id: string
  section: Section
  org: string
  url?: string
  location?: string
  /** `YYYY-MM` o `YYYY` */
  start: string
  /** `null` = actualitat; absent = data única */
  end?: string | null
  tags: string[]
}

export interface StackGroup {
  /** Clau i18n: `stack.groups.<id>` */
  id: string
  icon: string
  items: string[]
}
