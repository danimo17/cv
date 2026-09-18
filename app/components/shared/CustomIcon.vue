<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = withDefaults(
  defineProps<{
    name: string
    set?: 'solid' | 'brands'
    size?: Size
    label?: string
  }>(),
  { set: 'solid', size: 'md', label: '' }
)

const icon = computed(() => [props.set === 'brands' ? 'fab' : 'fas', props.name])
</script>

<template>
  <FontAwesomeIcon
    :icon="icon"
    :class="['custom-icon', `custom-icon--${size}`]"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label || undefined"
    :title="label || undefined"
  />
</template>
