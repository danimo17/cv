// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { type GiphyGif, GiphyQueryError, parseSearchQuery, toMeme } from '~~/server/utils/giphy'

describe('parseSearchQuery', () => {
  it('trims q and applies default limit/offset', () => {
    expect(parseSearchQuery({ q: '  cat  ' })).toEqual({ q: 'cat', limit: 12, offset: 0 })
  })

  it('accepts explicit numeric-string limit and offset', () => {
    expect(parseSearchQuery({ q: 'cat', limit: '25', offset: '24' })).toEqual({
      q: 'cat',
      limit: 25,
      offset: 24,
    })
  })

  it.each([
    ['missing q', {}],
    ['empty q', { q: '' }],
    ['whitespace q', { q: '   ' }],
    ['non-string q', { q: 42 }],
    ['q longer than 50 chars', { q: 'a'.repeat(51) }],
    ['q with control characters', { q: 'cat\u0000dog' }],
    ['q with a newline', { q: 'cat\ndog' }],
  ])('rejects %s with GiphyQueryError', (_label, input) => {
    expect(() => parseSearchQuery(input)).toThrow(GiphyQueryError)
  })

  it('accepts q of exactly 50 chars', () => {
    expect(parseSearchQuery({ q: 'a'.repeat(50) }).q).toHaveLength(50)
  })

  it.each([
    ['limit 0', { q: 'cat', limit: '0' }],
    ['limit 26', { q: 'cat', limit: '26' }],
    ['limit abc', { q: 'cat', limit: 'abc' }],
    ['limit 2.5', { q: 'cat', limit: '2.5' }],
    ['negative offset', { q: 'cat', offset: '-1' }],
    ['offset above 4999', { q: 'cat', offset: '5000' }],
  ])('rejects %s with GiphyQueryError', (_label, input) => {
    expect(() => parseSearchQuery(input)).toThrow(GiphyQueryError)
  })

  it('throws a GiphyQueryError that is also an Error', () => {
    try {
      parseSearchQuery({})
      expect.unreachable('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(GiphyQueryError)
      expect(e).toBeInstanceOf(Error)
      expect((e as Error).message).toMatch(/q must be/)
    }
  })
})

describe('toMeme', () => {
  const gif: GiphyGif = {
    id: 'abc',
    title: '  Cat typing  ',
    images: {
      fixed_width: { url: 'https://media.test/fw.gif', width: '200', height: '150' },
      original: { url: 'https://media.test/orig.gif', width: '480', height: '360' },
    },
  }

  it('maps a Giphy gif to the shared Meme shape', () => {
    expect(toMeme(gif)).toEqual({
      id: 'abc',
      title: 'Cat typing',
      preview: 'https://media.test/fw.gif',
      full: 'https://media.test/orig.gif',
      width: 480,
      height: 360,
    })
  })

  it('returns width and height as numbers', () => {
    const meme = toMeme(gif)
    expect(typeof meme.width).toBe('number')
    expect(typeof meme.height).toBe('number')
  })

  it('falls back to GIF when the title is empty', () => {
    expect(toMeme({ ...gif, title: '' }).title).toBe('GIF')
    expect(toMeme({ ...gif, title: '   ' }).title).toBe('GIF')
  })

  it('falls back to 0 when dimensions are not numeric', () => {
    const broken: GiphyGif = {
      ...gif,
      images: { ...gif.images, original: { url: 'u', width: 'x', height: '' } },
    }
    expect(toMeme(broken).width).toBe(0)
    expect(toMeme(broken).height).toBe(0)
  })
})
