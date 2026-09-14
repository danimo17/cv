<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <nav class="locale-switcher" :aria-label="t('locale.switch')">
    <AppLink
      v-for="item in locales"
      :key="item.code"
      :to="switchLocalePath(item.code)"
      :localize="false"
      variant="subtle"
      :class="['locale-switcher__item', { 'locale-switcher__item--active': item.code === locale }]"
      :aria-current="item.code === locale ? 'true' : undefined"
      :lang="item.code"
      :title="item.name"
      :data-testid="`locale-${item.code}`"
    >
      {{ item.code }}
    </AppLink>
  </nav>
</template>
