<script setup lang="ts">
defineProps<{
  /** Últims termes cercats, més recent primer (`useGiphyStore.history`), màxim 5. */
  terms: string[]
}>()
const emit = defineEmits<{ select: [term: string] }>()

const { t } = useI18n()
</script>

<template>
  <section v-if="terms.length" class="meme-recent-searches" data-testid="meme-recent-searches">
    <CustomText as="h2" variant="body" weight="semibold" class="meme-recent-searches__title">
      {{ t('meme.recentSearches.title') }}
    </CustomText>
    <ul class="meme-recent-searches__list">
      <li v-for="term in terms" :key="term">
        <CustomButton size="sm" variant="ghost" tone="neutral" @click="emit('select', term)">
          {{ term }}
        </CustomButton>
      </li>
    </ul>
  </section>
</template>
