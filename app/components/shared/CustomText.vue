<script setup lang="ts">
export type TextTag =
  | 'p'
  | 'span'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'small'
  | 'strong'
  | 'em'
  | 'label'
  | 'figcaption'
  | 'time'
  | 'li'
export type TextVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'lead' | 'body' | 'small' | 'caption' | 'eyebrow'
export type TextTone = 'default' | 'muted' | Tone
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextAlign = 'start' | 'center' | 'end'

withDefaults(
  defineProps<{
    as?: TextTag
    variant?: TextVariant
    tone?: TextTone
    weight?: TextWeight
    align?: TextAlign
    truncate?: boolean
  }>(),
  {
    as: 'p',
    variant: 'body',
    tone: 'default',
    weight: undefined,
    align: undefined,
    truncate: false,
  }
)
</script>

<template>
  <component
    :is="as"
    :class="[
      'custom-text',
      `custom-text--${variant}`,
      `custom-text--tone-${tone}`,
      weight && `custom-text--${weight}`,
      align && `custom-text--align-${align}`,
      { 'custom-text--truncate': truncate },
    ]"
  >
    <slot />
  </component>
</template>
