/** Forma normalitzada d'un GIF, compartida entre server i client. */
export interface Meme {
  id: string
  title: string
  /** URL de previsualització (fixed_width) */
  preview: string
  /** URL original */
  full: string
  width: number
  height: number
}

export interface GiphySearchResponse {
  items: Meme[]
  total: number
}
