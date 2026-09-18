import type { GiphySearchResponse } from '#shared/types/giphy'
import {
  type GiphyApiResponse,
  GiphyQueryError,
  parseSearchQuery,
  toMeme,
} from '~~/server/utils/giphy'

const GIPHY_SEARCH_URL = 'https://api.giphy.com/v1/gifs/search'

export default defineCachedEventHandler(
  async (event): Promise<GiphySearchResponse> => {
    let params
    try {
      params = parseSearchQuery(getQuery(event))
    } catch (e) {
      if (e instanceof GiphyQueryError) {
        throw createError({ statusCode: 400, statusMessage: e.message })
      }
      throw e
    }

    const { giphyApiKey } = useRuntimeConfig(event)
    if (!giphyApiKey) {
      throw createError({ statusCode: 503, statusMessage: 'Giphy is not configured' })
    }

    try {
      const res = await $fetch<GiphyApiResponse>(GIPHY_SEARCH_URL, {
        query: {
          api_key: giphyApiKey,
          q: params.q,
          limit: params.limit,
          offset: params.offset,
          rating: 'pg',
          lang: 'en',
        },
      })
      return { items: res.data.map(toMeme), total: res.pagination.total_count }
    } catch (e) {
      console.error('[giphy] upstream error', e instanceof Error ? e.message : e)
      throw createError({ statusCode: 502, statusMessage: 'Giphy is unavailable' })
    }
  },
  { maxAge: 60 * 60, name: 'giphy-search' }
)
