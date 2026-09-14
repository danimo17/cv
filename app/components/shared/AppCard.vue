<script setup lang="ts">
import type { Size } from '~/types/ui'

withDefaults(
  defineProps<{
    as?: string
    variant?: 'outline' | 'filled' | 'elevated'
    padding?: Size
  }>(),
  { as: 'div', variant: 'outline', padding: 'md' }
)
</script>

<template>
  <component :is="as" :class="['app-card', `app-card--${variant}`, `app-card--padding-${padding}`]">
    <div v-if="$slots.header" class="app-card__header"><slot name="header" /></div>
    <slot />
    <div v-if="$slots.footer" class="app-card__footer"><slot name="footer" /></div>
  </component>
</template>
