<script setup lang="ts">
import type { Meme } from '#shared/types/giphy'

defineProps<{ meme: Meme }>()
const emit = defineEmits<{ use: [meme: Meme]; cancel: [] }>()

const { t } = useI18n()
</script>

<template>
  <CustomCard variant="elevated" padding="md">
    <div class="meme-preview" data-testid="meme-preview">
      <CustomImage :src="meme.full" :alt="meme.title" radius="lg" class="meme-preview__image" />
      <div class="meme-preview__body">
        <CustomText as="p" variant="lead" weight="semibold" class="meme-preview__title">
          {{ meme.title }}
        </CustomText>
        <CustomText as="p" variant="small" tone="muted" class="meme-preview__meta">
          {{ t('meme.preview.size', { width: meme.width, height: meme.height }) }}
        </CustomText>
        <div class="meme-preview__actions">
          <CustomButton
            tone="success"
            icon="wand-magic-sparkles"
            data-testid="meme-use"
            @click="emit('use', meme)"
          >
            {{ t('meme.preview.use') }}
          </CustomButton>
          <CustomButton variant="ghost" tone="neutral" icon="xmark" @click="emit('cancel')">
            {{ t('meme.preview.cancel') }}
          </CustomButton>
        </div>
      </div>
    </div>
  </CustomCard>
</template>
