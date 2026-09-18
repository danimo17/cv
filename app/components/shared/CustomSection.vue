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
  <section :id="id" class="custom-section" :aria-labelledby="`${id}-title`">
    <header class="custom-section__header">
      <CustomText
        v-if="eyebrow"
        as="p"
        variant="eyebrow"
        tone="primary"
        class="custom-section__eyebrow"
      >
        <CustomIcon v-if="icon" :name="icon" size="sm" />
        {{ eyebrow }}
      </CustomText>
      <CustomText :id="`${id}-title`" as="h2" variant="h2" class="custom-section__title">
        {{ title }}
      </CustomText>
      <CustomText
        v-if="subtitle"
        as="p"
        variant="body"
        tone="muted"
        class="custom-section__subtitle"
      >
        {{ subtitle }}
      </CustomText>
    </header>
    <slot />
  </section>
</template>
