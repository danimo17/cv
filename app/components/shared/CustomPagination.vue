<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Pàgina actual, 1-indexada. */
    page: number
    /** Nombre total d'elements paginables (no de pàgines). */
    total: number
    /** Elements per pàgina. */
    perPage?: number
  }>(),
  { perPage: 12 }
)

const emit = defineEmits<{ 'update:page': [page: number] }>()

const { t } = useI18n()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const hasPrevious = computed(() => props.page > 1)
const hasNext = computed(() => props.page < pageCount.value)

function go(target: number) {
  const clamped = Math.min(Math.max(target, 1), pageCount.value)
  if (clamped !== props.page) emit('update:page', clamped)
}
</script>

<template>
  <nav v-if="pageCount > 1" class="custom-pagination" :aria-label="t('pagination.title')">
    <CustomButton
      variant="ghost"
      tone="neutral"
      size="sm"
      icon="chevron-left"
      :disabled="!hasPrevious"
      :aria-label="t('pagination.previous')"
      @click="go(page - 1)"
    />
    <CustomText as="span" variant="small" tone="muted" class="custom-pagination__status">
      {{ t('pagination.page', { page, total: pageCount }) }}
    </CustomText>
    <CustomButton
      variant="ghost"
      tone="neutral"
      size="sm"
      icon="chevron-right"
      :disabled="!hasNext"
      :aria-label="t('pagination.next')"
      @click="go(page + 1)"
    />
  </nav>
</template>
