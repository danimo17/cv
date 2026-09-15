<script setup lang="ts">
withDefaults(defineProps<{ shape?: 'text' | 'image' | 'circle' }>(), { shape: 'text' })
</script>

<template>
  <div :class="['custom-skeleton', `custom-skeleton--${shape}`]" aria-hidden="true" />
</template>
