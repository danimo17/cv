<script setup lang="ts">
const props = withDefaults(defineProps<{ loading?: boolean; initial?: string }>(), {
  loading: false,
  initial: '',
})
const emit = defineEmits<{ search: [query: string] }>()

const { t } = useI18n()
const query = ref(props.initial)

// `initial` només fixa el valor de muntatge; si canvia després (p. ex. una recent search
// executada des de fora), el camp s'hi torna a sincronitzar.
watch(
  () => props.initial,
  (value) => {
    query.value = value
  }
)

function submit() {
  const q = query.value.trim()
  if (q) emit('search', q)
}
</script>

<template>
  <form class="meme-search" role="search" @submit.prevent="submit">
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
    <CustomButton
      type="submit"
      icon="magnifying-glass"
      :loading="loading"
      :disabled="!query.trim()"
      data-testid="meme-search-submit"
    >
      {{ t('meme.search.button') }}
    </CustomButton>
  </form>
</template>
