import type { ComputedRef, MaybeRefOrGetter } from 'vue'

/**
 * Llegeix una clau i18n que és un array de missatges (`tm` + `rt`) i retorna `string[]`.
 * Evita el tipat recursiu de `Parameters<typeof rt>` (TS2589) amb un cast estructural mínim.
 */
export function useMessageList(key: MaybeRefOrGetter<string>): ComputedRef<string[]> {
  const { tm, rt } = useI18n()
  return computed(() => {
    const raw: unknown = tm(toValue(key))
    return Array.isArray(raw) ? raw.map((m: unknown) => rt(m as string)) : []
  })
}
