export const DEFAULT_GIPHY_LIMIT = 12
const HISTORY_SIZE = 5

export const useGiphyStore = defineStore('giphy', () => {
  const query = ref('')
  const limit = ref(DEFAULT_GIPHY_LIMIT)
  const offset = ref(0)
  const history = ref<string[]>([])

  const { data, status, error, execute } = giphyService.createSearch(query, limit, offset)

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const errorKey = computed(() =>
    status.value === 'error' ? giphyService.toUserErrorKey(error.value) : ''
  )

  async function search(q: string) {
    query.value = q.trim()
    if (!query.value) return
    history.value = [query.value, ...history.value.filter((term) => term !== query.value)].slice(
      0,
      HISTORY_SIZE
    )
    await goToOffset(0)
  }

  async function goToOffset(newOffset: number) {
    const previous = offset.value
    offset.value = newOffset
    await execute()
    if (status.value === 'error') offset.value = previous
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
