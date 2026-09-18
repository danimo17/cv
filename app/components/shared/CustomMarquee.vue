<script setup lang="ts">
export type MarqueeSpeed = 'slow' | 'normal' | 'fast'

withDefaults(
  defineProps<{
    label: string
    speed?: MarqueeSpeed
    pauseOnHover?: boolean
    tone?: Tone
    size?: Size
  }>(),
  { speed: 'normal', pauseOnHover: true, tone: 'primary', size: 'md' }
)

defineSlots<{
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
