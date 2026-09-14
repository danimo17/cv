<script setup lang="ts">
export type ImageFit = 'cover' | 'contain'
export type ImageRadius = 'none' | 'md' | 'lg' | 'xl' | 'full'

// Únic embolcall d'imatges (decisió 026, sense @nuxt/image per decisió 018).
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
    /** Vora + ombra al voltant de la imatge */
    frame?: boolean
  }>(),
  {
    width: undefined,
    height: undefined,
    loading: 'lazy',
    fit: 'cover',
    radius: 'none',
    frame: false,
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
    :class="[
      'app-image',
      `app-image--fit-${fit}`,
      `app-image--radius-${radius}`,
      { 'app-image--frame': frame },
    ]"
  />
</template>
