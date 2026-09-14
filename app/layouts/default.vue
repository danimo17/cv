<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="app-shell">
    <AppLink href="#main" variant="subtle" class="skip-link">{{ t('nav.skipToContent') }}</AppLink>
    <AppHeader />
    <SourceBanner />
    <main id="main" class="app-shell__main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
