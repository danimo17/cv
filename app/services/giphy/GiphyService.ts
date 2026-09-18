export interface FetchLikeError {
  statusCode?: number
}

const SEARCH_ENDPOINT = '/api/giphy/search'

export class GiphyService {
  createSearch(query: Ref<string>, limit: Ref<number> | number, offset: Ref<number> | number = 0) {
    return useFetch<GiphySearchResponse>(SEARCH_ENDPOINT, {
      query: { q: query, limit, offset },
      immediate: false,
      watch: false,
    })
  }

  toUserErrorKey(error: FetchLikeError | null | undefined): string {
    switch (error?.statusCode) {
      case 400:
        return 'meme.results.badQuery'
      case 503:
        return 'meme.results.notConfigured'
      default:
        return 'meme.results.error'
    }
  }
}

export const giphyService = new GiphyService()
