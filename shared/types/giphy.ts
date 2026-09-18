export interface Meme {
  id: string
  title: string
  preview: string
  full: string
  width: number
  height: number
}

export interface GiphySearchResponse {
  items: Meme[]
  total: number
}
