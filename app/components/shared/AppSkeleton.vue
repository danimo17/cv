<script setup lang="ts">
withDefaults(defineProps<{ shape?: 'text' | 'image' | 'circle' }>(), { shape: 'text' })
</script>

<template>
  <div :class="['app-skeleton', `app-skeleton--${shape}`]" aria-hidden="true" />
</template>
