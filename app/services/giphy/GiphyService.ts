import type { Ref } from 'vue'
import { useFetch } from '#app'
import type { GiphySearchResponse } from '#shared/types/giphy'

/** Forma mínima d'un error de `useFetch` que ens interessa (evita dependre del tipus complet). */
export interface FetchLikeError {
  statusCode?: number
}

const SEARCH_ENDPOINT = '/api/giphy/search'

/**
 * Capa de servei (decisió 029): únic lloc del client que coneix `/api/giphy/*` (regla 03).
 * Defineix la petició i normalitza els errors a claus i18n. Sense estat: l'estat viu a `useGiphyStore`.
 */
export class GiphyService {
  /**
   * Crea el handle de `useFetch` (immediate: false, watch: false). L'executa qui el crida
   * (les accions `search`/`goToOffset` de la store). S'ha de cridar dins d'un context Nuxt (setup
   * de store/component).
   */
  createSearch(query: Ref<string>, limit: Ref<number> | number, offset: Ref<number> | number = 0) {
    return useFetch<GiphySearchResponse>(SEARCH_ENDPOINT, {
      query: { q: query, limit, offset },
      immediate: false,
      watch: false,
    })
  }

  /** Mapa estat HTTP → clau i18n del missatge d'usuari. */
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
