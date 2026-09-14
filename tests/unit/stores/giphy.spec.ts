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
})
