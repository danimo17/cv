<script setup lang="ts">
const props = withDefaults(defineProps<{ loading?: boolean; initial?: string }>(), {
  loading: false,
  initial: '',
})
const emit = defineEmits<{ search: [query: string] }>()

const { t } = useI18n()
const query = ref(props.initial)

function submit() {
  const q = query.value.trim()
  if (q) emit('search', q)
}
</script>

<template>
  <form class="meme-search" role="search" @submit.prevent="submit">
    <AppInput
      id="meme-query"
      v-model="query"
      class="meme-search__input"
      :label="t('meme.search.label')"
      :placeholder="t('meme.search.placeholder')"
      icon="magnifying-glass"
      type="search"
      hide-label
    />
    <AppButton
      type="submit"
      icon="magnifying-glass"
      :loading="loading"
      :disabled="!query.trim()"
      data-testid="meme-search-submit"
    >
      {{ t('meme.search.button') }}
    </AppButton>
  </form>
</template>
