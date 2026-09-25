<script setup lang="ts">
const props = withDefaults(defineProps<{ loading?: boolean; initial?: string }>(), {
  loading: false,
  initial: '',
})
const emit = defineEmits<{ search: [query: string] }>()

const { t } = useI18n()
const query = ref(props.initial)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.initial,
  (value) => {
    query.value = value
  }
)

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  const trimmed = value.trim()
  if (!trimmed) return
  debounceTimer = setTimeout(() => {
    emit('search', trimmed)
  }, 1500)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <form class="meme-search" role="search" @submit.prevent>
    <CustomInput
      id="meme-query"
      v-model="query"
      class="meme-search__input"
      :label="t('meme.search.label')"
      :placeholder="t('meme.search.placeholder')"
      icon="magnifying-glass"
      type="search"
      hide-label
    />
    <CustomText
      v-if="loading"
      as="span"
      variant="caption"
      tone="muted"
      class="meme-search__status"
      data-testid="meme-search-loading"
    >
      {{ t('meme.search.searching') }}
    </CustomText>
  </form>
</template>
