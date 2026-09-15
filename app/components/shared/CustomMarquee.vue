<script setup lang="ts">
import type { Size, Tone } from '~/types/ui'

export type MarqueeSpeed = 'slow' | 'normal' | 'fast'

// Banner horitzontal infinit: el slot es renderitza dues vegades (la còpia és aria-hidden + inert)
// i la pista es desplaça -50% en bucle. Respecta prefers-reduced-motion via custom-marquee.css.
withDefaults(
  defineProps<{
    /** Text accessible del contenidor (i18n) */
    label: string
    speed?: MarqueeSpeed
    pauseOnHover?: boolean
    tone?: Tone
    size?: Size
  }>(),
  { speed: 'normal', pauseOnHover: true, tone: 'primary', size: 'md' }
)

defineSlots<{
  /** `duplicate` és true a la segona còpia: posa-hi `tabindex="-1"` als enllaços */
  default(props: { duplicate: boolean }): unknown
}>()
</script>

<template>
  <div
    :class="[
      'custom-marquee',
      `custom-marquee--${speed}`,
      `custom-marquee--${tone}`,
      `custom-marquee--${size}`,
      { 'custom-marquee--pause': pauseOnHover },
    ]"
    :aria-label="label"
  >
    <div class="custom-marquee__track">
      <div class="custom-marquee__copy"><slot :duplicate="false" /></div>
      <div class="custom-marquee__copy" aria-hidden="true" inert><slot :duplicate="true" /></div>
    </div>
  </div>
</template>
