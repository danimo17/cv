import type { Meme } from '#shared/types/giphy'

export class GiphyQueryError extends Error {}

export interface SearchParams {
  q: string
  limit: number
  offset: number
}

const MAX_QUERY_LENGTH = 50

export function parseSearchQuery(input: Record<string, unknown>): SearchParams {
  const q = typeof input.q === 'string' ? input.q.trim() : ''
  if (!q || q.length > MAX_QUERY_LENGTH || /\p{Cc}/u.test(q)) {
    throw new GiphyQueryError(`q must be 1-${MAX_QUERY_LENGTH} printable characters`)
  }
  return {
    q,
    limit: toInt(input.limit, 'limit', 12, 1, 25),
    offset: toInt(input.offset, 'offset', 0, 0, 4999),
  }
}

function toInt(value: unknown, name: string, fallback: number, min: number, max: number): number {
  if (value === undefined || value === '') return fallback
  const n = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new GiphyQueryError(`${name} must be an integer between ${min} and ${max}`)
  }
  return n
}

interface GiphyImage {
  url: string
  width: string
  height: string
}

export interface GiphyGif {
  id: string
  title: string
  images: { fixed_width: GiphyImage; original: GiphyImage }
}

export interface GiphyApiResponse {
  data: GiphyGif[]
  pagination: { total_count: number }
}

export function toMeme(gif: GiphyGif): Meme {
  return {
    id: gif.id,
    title: gif.title?.trim() || 'GIF',
    preview: gif.images.fixed_width.url,
    full: gif.images.original.url,
    width: Number(gif.images.original.width) || 0,
    height: Number(gif.images.original.height) || 0,
  }
}
