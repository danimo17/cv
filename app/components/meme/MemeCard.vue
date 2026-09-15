<script setup lang="ts">
import type { Meme } from '#shared/types/giphy'

withDefaults(defineProps<{ meme: Meme; selected?: boolean }>(), { selected: false })
const emit = defineEmits<{ select: [meme: Meme] }>()

const { t } = useI18n()
</script>

<template>
  <CustomButton
    variant="ghost"
    tone="neutral"
    :class="['meme-card', { 'meme-card--selected': selected }]"
    :aria-pressed="selected"
    :aria-label="t('meme.results.select', { title: meme.title })"
    data-testid="meme-card"
    @click="emit('select', meme)"
  >
    <CustomImage
      :src="meme.preview"
      :alt="meme.title"
      :width="meme.width"
      :height="meme.height"
      class="meme-card__image"
      loading="lazy"
    />
    <CustomText as="span" variant="caption" truncate class="meme-card__title" aria-hidden="true">
      {{ meme.title }}
    </CustomText>
  </CustomButton>
</template>
