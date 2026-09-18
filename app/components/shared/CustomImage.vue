<script setup lang="ts">
export type ImageFit = 'cover' | 'contain'
export type ImageRadius = 'none' | 'md' | 'lg' | 'xl' | 'full'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    src: string
    alt: string
    width?: number | string
    height?: number | string
    loading?: 'lazy' | 'eager'
    fit?: ImageFit
    radius?: ImageRadius
    frame?: boolean
    srcset?: string
    sizes?: string
  }>(),
  {
    width: undefined,
    height: undefined,
    loading: 'lazy',
    fit: 'cover',
    radius: 'none',
    frame: false,
    srcset: undefined,
    sizes: undefined,
  }
)
</script>

<template>
  <img
    v-bind="$attrs"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :srcset="srcset"
    :sizes="sizes"
    :class="[
      'custom-image',
      `custom-image--fit-${fit}`,
      `custom-image--radius-${radius}`,
      { 'custom-image--frame': frame },
    ]"
  />
</template>
