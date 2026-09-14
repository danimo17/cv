<script setup lang="ts">
// Únic wrapper de Font Awesome (no-restricted-imports a la resta del codi).
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { Size } from '~/types/ui'

const props = withDefaults(
  defineProps<{
    /** Nom de la icona sense prefix, p. ex. `sun` (ha d'estar registrada a plugins/fontawesome.ts) */
    name: string
    set?: 'solid' | 'brands'
    size?: Size
    /** Si es passa, la icona és informativa (aria-label); si no, és decorativa (aria-hidden) */
    label?: string
  }>(),
  { set: 'solid', size: 'md', label: '' }
)

const icon = computed(() => [props.set === 'brands' ? 'fab' : 'fas', props.name])
</script>

<template>
  <FontAwesomeIcon
    :icon="icon"
    :class="['app-icon', `app-icon--${size}`]"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label || undefined"
    :title="label || undefined"
  />
</template>
