import { describe, expect, it } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { createError, useNuxtApp } from '#app'
import type { Meme } from '#shared/types/giphy'
import { useGiphyStore } from '~/stores/giphy'

const meme: Meme = {
  id: 'm1',
  title: 'Cat typing',
  preview: 'https://example.test/p.gif',
  full: 'https://example.test/f.gif',
  width: 480,
  height: 480,
}

// El mateix endpoint simula els tres resultats del servidor segons la query (regla 03: només el
// servei coneix la ruta; aquí només es registra el mock).
registerEndpoint('/api/giphy/search', (event) => {
  const q = new URL(event.path, 'http://localhost').searchParams.get('q')
  if (q === 'bad') throw createError({ statusCode: 400, statusMessage: 'bad query' })
  if (q === 'down') throw createError({ statusCode: 503, statusMessage: 'not configured' })
  return { items: [meme], total: 1 }
})

// La store és un singleton dins de l'app Nuxt de test (el useFetch es crea una sola vegada):
// els tests s'encadenen en ordre sobre la mateixa instància.
function store() {
  return useNuxtApp().runWithContext(() => useGiphyStore())
}

describe('useGiphyStore', () => {
  it('is idle before the first search with the default limit', () => {
    const giphy = store()
    expect(giphy.status).toBe('idle')
    expect(giphy.items).toEqual([])
    expect(giphy.query).toBe('')
    expect(giphy.errorKey).toBe('')
    expect(giphy.limit).toBe(12)
  })

  it('search with a blank query does nothing', async () => {
    const giphy = store()
    await giphy.search('   ')
    expect(giphy.query).toBe('')
    expect(giphy.items).toEqual([])
    expect(giphy.status).toBe('idle')
  })

  it('search populates items and stores the trimmed query', async () => {
    const giphy = store()
    await giphy.search('  cat ')
    expect(giphy.query).toBe('cat')
    expect(giphy.items).toHaveLength(1)
    expect(giphy.items[0]).toEqual(meme)
    expect(giphy.status).toBe('success')
    expect(giphy.errorKey).toBe('')
  })

  it('a 400 from the server maps to the badQuery message key and clears the items', async () => {
    const giphy = store()
    await giphy.search('bad')
    expect(giphy.status).toBe('error')
    expect(giphy.items).toEqual([])
    expect(giphy.errorKey).toBe('meme.results.badQuery')
  })

  it('a 503 from the server maps to the notConfigured message key', async () => {
    const giphy = store()
    await giphy.search('down')
    expect(giphy.status).toBe('error')
    expect(giphy.errorKey).toBe('meme.results.notConfigured')
  })

  it('a later successful search clears the error key', async () => {
    const giphy = store()
    await giphy.search('cat')
    expect(giphy.status).toBe('success')
    expect(giphy.errorKey).toBe('')
    expect(giphy.items).toHaveLength(1)
  })

  it('a successful search exposes the total from the response', async () => {
    const giphy = store()
    await giphy.search('cat')
    expect(giphy.total).toBe(1)
  })
})

// Historial de termes cercats (decisió 034): distint de `useHeroStore.history` (memes portats).
// Continua sobre el mateix singleton (regla del fitxer: la store es crea una sola vegada).
describe('useGiphyStore · history', () => {
  it('starts with the entries accumulated so far and keeps deduping to the front', async () => {
    const giphy = store()
    // Estat heretat de la suite anterior: ['cat', 'down', 'bad'] (cat mogut al davant en el darrer search).
    expect(giphy.history).toEqual(['cat', 'down', 'bad'])

    await giphy.search('dog')
    expect(giphy.history).toEqual(['dog', 'cat', 'down', 'bad'])

    await giphy.search('bird')
    expect(giphy.history).toEqual(['bird', 'dog', 'cat', 'down', 'bad'])
  })

  it('caps the history at 5 entries, dropping the oldest', async () => {
    const giphy = store()
    await giphy.search('fish')
    expect(giphy.history).toEqual(['fish', 'bird', 'dog', 'cat', 'down'])
    expect(giphy.history).toHaveLength(5)
  })

  it('re-searching an existing term moves it to the front without growing the list', async () => {
    const giphy = store()
    await giphy.search('cat')
    expect(giphy.history).toEqual(['cat', 'fish', 'bird', 'dog', 'down'])
    expect(giphy.history).toHaveLength(5)
  })

  it('a blank search does not touch the history', async () => {
    const giphy = store()
    const before = [...giphy.history]
    await giphy.search('   ')
    expect(giphy.history).toEqual(before)
  })
})

describe('useGiphyStore · pagination', () => {
  it('starts at offset 0', () => {
    const giphy = store()
    expect(giphy.offset).toBe(0)
  })

  it('goToOffset changes the page without touching the query or history', async () => {
    const giphy = store()
    const historyBefore = [...giphy.history]
    const queryBefore = giphy.query
    await giphy.goToOffset(12)
    expect(giphy.offset).toBe(12)
    expect(giphy.query).toBe(queryBefore)
    expect(giphy.history).toEqual(historyBefore)
  })

  it('a new search resets the offset back to 0', async () => {
    const giphy = store()
    await giphy.goToOffset(24)
    expect(giphy.offset).toBe(24)
    await giphy.search('cat')
    expect(giphy.offset).toBe(0)
  })
})
