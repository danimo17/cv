import { giphyService } from '~/services/giphy/GiphyService'

export const DEFAULT_GIPHY_LIMIT = 12

/**
 * Estat de la cerca de memes (decisió 029). Únic lloc on es crea el `useFetch` del servei;
 * les vistes només llegeixen `items`/`status`/`errorKey` i disparen `search()`.
 */
export const useGiphyStore = defineStore('giphy', () => {
  const query = ref('')
  const limit = ref(DEFAULT_GIPHY_LIMIT)

  const { data, status, error, execute } = giphyService.createSearch(query, limit)

  const items = computed(() => data.value?.items ?? [])
  const errorKey = computed(() =>
    status.value === 'error' ? giphyService.toUserErrorKey(error.value) : ''
  )

  /** Retalla la consulta, ignora les buides i executa la petició. */
  async function search(q: string) {
    query.value = q.trim()
    if (!query.value) return
    await execute()
  }

  return { query, limit, items, status, error, errorKey, search }
})
