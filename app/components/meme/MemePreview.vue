<script setup lang="ts">
import type { Meme } from '#shared/types/giphy'

defineProps<{ meme: Meme }>()
const emit = defineEmits<{ use: [meme: Meme]; cancel: [] }>()

const { t } = useI18n()
</script>

<template>
  <AppCard variant="elevated" padding="md">
    <div class="meme-preview" data-testid="meme-preview">
      <AppImage :src="meme.full" :alt="meme.title" radius="lg" class="meme-preview__image" />
      <div class="meme-preview__body">
        <AppText as="p" variant="lead" weight="semibold" class="meme-preview__title">
          {{ meme.title }}
        </AppText>
        <AppText as="p" variant="small" tone="muted" class="meme-preview__meta">
          {{ t('meme.preview.size', { width: meme.width, height: meme.height }) }}
        </AppText>
        <div class="meme-preview__actions">
          <AppButton
            tone="success"
            icon="wand-magic-sparkles"
            data-testid="meme-use"
            @click="emit('use', meme)"
          >
            {{ t('meme.preview.use') }}
          </AppButton>
          <AppButton variant="ghost" tone="neutral" icon="xmark" @click="emit('cancel')">
            {{ t('meme.preview.cancel') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppCard>
</template>
