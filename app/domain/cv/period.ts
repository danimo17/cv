export function formatPeriod(
  start: string,
  end: string | null | undefined,
  locale: string,
  presentLabel: string
): string {
  const label = (iso: string) => {
    const yearOnly = /^\d{4}$/.test(iso)
    const date = new Date(`${yearOnly ? `${iso}-01` : iso}-01T00:00:00Z`)
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      ...(yearOnly ? {} : { month: 'short' }),
      timeZone: 'UTC',
    }).format(date)
  }
  if (end === undefined) return label(start)
  return `${label(start)} – ${end === null ? presentLabel : label(end)}`
}
