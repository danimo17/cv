export function useMessageList(key: MaybeRefOrGetter<string>): ComputedRef<string[]> {
  const { tm, rt } = useI18n()
  return computed(() => {
    const raw: unknown = tm(toValue(key))
    return Array.isArray(raw) ? raw.map((m: unknown) => rt(m as string)) : []
  })
}
