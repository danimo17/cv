<script setup lang="ts">
const colorMode = useColorMode()
const { t } = useI18n()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <AppButton
      variant="ghost"
      tone="neutral"
      class="theme-toggle"
      :icon="isDark ? 'sun' : 'moon'"
      :aria-label="t('theme.toggle')"
      :aria-pressed="isDark"
      :title="isDark ? t('theme.light') : t('theme.dark')"
      data-testid="theme-toggle"
      @click="toggle"
    />
    <template #fallback>
      <div class="theme-toggle" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>
