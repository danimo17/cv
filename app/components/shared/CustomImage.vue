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
    /** `srcset` de l'`<img>` natiu; opcional, decisió 037 (sense mides generades encara) */
    srcset?: string
    /** `sizes` de l'`<img>` natiu; només té efecte si `srcset` també es passa */
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
