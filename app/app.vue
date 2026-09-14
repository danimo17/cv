<script setup lang="ts">
const head = useLocaleHead({ dir: true, lang: true, seo: true })
const { t } = useI18n()

useHead(head)
useHead({
  titleTemplate: (title) => (title ? `${title} · ${t('nav.brand')}` : t('meta.title')),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
