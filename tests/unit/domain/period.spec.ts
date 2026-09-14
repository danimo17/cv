// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { formatPeriod } from '~/domain/cv/period'

const DASH = ' – '

function monthLabel(locale: string, iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}-01T00:00:00Z`))
}

describe('formatPeriod', () => {
  it('renders an open-ended period with the present label', () => {
    const out = formatPeriod('2023-10', null, 'en', 'Present')
    expect(out).toContain('Oct 2023')
    expect(out).toContain('Present')
    expect(out).toBe(`Oct 2023${DASH}Present`)
  })

  it('renders a closed period with an en dash', () => {
    expect(formatPeriod('2021-02', '2021-10', 'en', 'Present')).toBe('Feb 2021 – Oct 2021')
  })

  it('renders a year-only single date as the year', () => {
    expect(formatPeriod('2018', undefined, 'en', 'Present')).toBe('2018')
  })

  it('renders a single month date without a dash', () => {
    const out = formatPeriod('2015-03', undefined, 'en', 'Present')
    expect(out).toBe('Mar 2015')
    expect(out).not.toContain('–')
    expect(out).not.toContain('Present')
  })

  it('renders a year-only closed period', () => {
    expect(formatPeriod('2018', '2019', 'en', 'Present')).toBe('2018 – 2019')
  })

  it('follows the locale for month labels', () => {
    const ca = formatPeriod('2021-02', '2021-10', 'ca', 'Actualitat')
    const en = formatPeriod('2021-02', '2021-10', 'en', 'Present')
    expect(ca).toBe(`${monthLabel('ca', '2021-02')}${DASH}${monthLabel('ca', '2021-10')}`)
    expect(ca).not.toBe(en)
  })

  it('uses the given present label per locale', () => {
    expect(formatPeriod('2023-10', null, 'ca', 'Actualitat')).toBe(
      `${monthLabel('ca', '2023-10')}${DASH}Actualitat`
    )
  })
})
