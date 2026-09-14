<script setup lang="ts">
import type { Size, Tone } from '~/types/ui'

withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'ghost'
    tone?: Tone
    size?: Size
  }>(),
  { variant: 'solid', tone: 'primary', size: 'md' }
)

const { locale, t } = useI18n()
// PDF per idioma a public/cv/ (regla 04: sense telèfon ni adreça).
const href = computed(() => `/cv/cv-${locale.value}.pdf`)
</script>

<template>
  <div class="cv-download">
    <AppButton :href="href" :variant="variant" :tone="tone" :size="size" icon="download" download>
      {{ t('cv.download') }}
    </AppButton>
  </div>
</template>
