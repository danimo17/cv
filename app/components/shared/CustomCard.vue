<script setup lang="ts">
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
  <component
    :is="as"
    :class="['custom-card', `custom-card--${variant}`, `custom-card--padding-${padding}`]"
  >
    <div v-if="$slots.header" class="custom-card__header"><slot name="header" /></div>
    <slot />
    <div v-if="$slots.footer" class="custom-card__footer"><slot name="footer" /></div>
  </component>
</template>
