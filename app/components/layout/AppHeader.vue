<script setup lang="ts">
const { t } = useI18n()

const links = [
  { to: '/', key: 'nav.home' },
  { to: '/meme', key: 'nav.meme' },
]
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <CustomLink to="/" variant="subtle" tone="neutral" class="app-header__brand">
        {{ t('nav.brand') }}
      </CustomLink>
      <nav class="app-header__nav" :aria-label="t('nav.main')">
        <CustomLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          variant="nav"
          class="app-header__link"
        >
          {{ t(link.key) }}
        </CustomLink>
      </nav>
      <div class="app-header__tools">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
