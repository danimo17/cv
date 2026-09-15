import { giphyService } from '~/services/giphy/GiphyService'

export const DEFAULT_GIPHY_LIMIT = 12
const HISTORY_SIZE = 5

/**
 * Estat de la cerca de memes (decisió 029). Únic lloc on es crea el `useFetch` del servei;
 * les vistes només llegeixen `items`/`status`/`errorKey`/`total`/`history` i disparen `search()`/`goToOffset()`.
 */
export const useGiphyStore = defineStore('giphy', () => {
  const query = ref('')
  const limit = ref(DEFAULT_GIPHY_LIMIT)
  const offset = ref(0)
  /** Últims termes cercats, més recent primer, sense duplicats (decisió 034: no és `hero.history`). */
  const history = ref<string[]>([])

  const { data, status, error, execute } = giphyService.createSearch(query, limit, offset)

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const errorKey = computed(() =>
    status.value === 'error' ? giphyService.toUserErrorKey(error.value) : ''
  )

  /** Retalla la consulta, ignora les buides, reinicia la pàgina, actualitza l'historial i executa la petició. */
  async function search(q: string) {
    query.value = q.trim()
    if (!query.value) return
    offset.value = 0
    history.value = [query.value, ...history.value.filter((term) => term !== query.value)].slice(
      0,
      HISTORY_SIZE
    )
    await execute()
  }

  /** Canvia de pàgina (mateixa consulta): actualitza l'offset i torna a executar. */
  async function goToOffset(newOffset: number) {
    offset.value = newOffset
    await execute()
  }

  return {
    query,
    limit,
    offset,
    total,
    items,
    status,
    error,
    errorKey,
    history,
    search,
    goToOffset,
  }
})
