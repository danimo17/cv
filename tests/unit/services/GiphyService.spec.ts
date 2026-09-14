import { describe, expect, it } from 'vitest'
import { GiphyService, giphyService } from '~/services/giphy/GiphyService'

describe('GiphyService', () => {
  it('exports a single shared instance', () => {
    expect(giphyService).toBeInstanceOf(GiphyService)
  })

  describe('toUserErrorKey', () => {
    it.each([
      [400, 'meme.results.badQuery'],
      [503, 'meme.results.notConfigured'],
      [502, 'meme.results.error'],
      [500, 'meme.results.error'],
      [undefined, 'meme.results.error'],
    ])('status %s → %s', (statusCode, key) => {
      expect(giphyService.toUserErrorKey({ statusCode })).toBe(key)
    })

    it('handles a missing error', () => {
      expect(giphyService.toUserErrorKey(null)).toBe('meme.results.error')
      expect(giphyService.toUserErrorKey(undefined)).toBe('meme.results.error')
    })
  })
})
