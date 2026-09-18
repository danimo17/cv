<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'ghost'
    tone?: Tone
    size?: Size
  }>(),
  { variant: 'solid', tone: 'primary', size: 'md' }
)

const { locale, t } = useI18n()
const href = computed(() => `/cv/cv-${locale.value}.pdf`)
</script>

<template>
  <div class="cv-download">
    <CustomButton
      :href="href"
      :variant="variant"
      :tone="tone"
      :size="size"
      icon="download"
      download
    >
      {{ t('cv.download') }}
    </CustomButton>
  </div>
</template>
