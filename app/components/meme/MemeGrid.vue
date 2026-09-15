<script setup lang="ts">
import type { AsyncDataRequestStatus } from '#app'
import type { Meme } from '#shared/types/giphy'

withDefaults(
  defineProps<{
    items: Meme[]
    status: AsyncDataRequestStatus
    selectedId?: string | null
    skeletons?: number
    /** Clau i18n del missatge d'error (la produeix `GiphyService.toUserErrorKey`) */
    errorKey?: string
  }>(),
  { selectedId: null, skeletons: 8, errorKey: 'meme.results.error' }
)
const emit = defineEmits<{ select: [meme: Meme] }>()

const { t } = useI18n()
</script>

<template>
  <div class="meme-grid" aria-live="polite">
    <div v-if="status === 'pending'" class="meme-grid__skeletons" data-testid="meme-skeletons">
      <CustomSkeleton v-for="n in skeletons" :key="n" shape="image" />
    </div>
    <CustomAlert
      v-else-if="status === 'error'"
      tone="danger"
      class="meme-grid__state"
      :title="t('meme.results.errorTitle')"
    >
      {{ t(errorKey) }}
    </CustomAlert>
    <CustomAlert
      v-else-if="status === 'success' && items.length === 0"
      tone="info"
      class="meme-grid__state"
    >
      {{ t('meme.results.empty') }}
    </CustomAlert>
    <ul v-else-if="items.length" class="meme-grid__list">
      <li v-for="meme in items" :key="meme.id">
        <MemeCard
          :meme="meme"
          :selected="meme.id === selectedId"
          @select="emit('select', $event)"
        />
      </li>
    </ul>
  </div>
</template>
