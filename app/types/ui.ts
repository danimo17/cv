export const TONES = [
  'primary',
  'secondary',
  'neutral',
  'success',
  'info',
  'warning',
  'danger',
] as const
export type Tone = (typeof TONES)[number]

export const SIZES = ['sm', 'md', 'lg'] as const
export type Size = (typeof SIZES)[number]
