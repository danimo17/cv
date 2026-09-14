<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    title: string
    eyebrow?: string
    icon?: string
    subtitle?: string
  }>(),
  { eyebrow: '', icon: '', subtitle: '' }
)
</script>

<template>
  <section :id="id" class="app-section" :aria-labelledby="`${id}-title`">
    <header class="app-section__header">
      <AppText v-if="eyebrow" as="p" variant="eyebrow" tone="primary" class="app-section__eyebrow">
        <AppIcon v-if="icon" :name="icon" size="sm" />
        {{ eyebrow }}
      </AppText>
      <AppText :id="`${id}-title`" as="h2" variant="h2" class="app-section__title">
        {{ title }}
      </AppText>
      <AppText v-if="subtitle" as="p" variant="body" tone="muted" class="app-section__subtitle">
        {{ subtitle }}
      </AppText>
    </header>
    <slot />
  </section>
</template>
