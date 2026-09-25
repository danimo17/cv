<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  locales.value.map((item) => ({ value: item.code, label: item.name ?? item.code }))
)

function onLocaleChange(value: 'en' | 'ca' | 'es' | undefined) {
  if (!value) return
  const path = switchLocalePath(value)
  if (path) navigateTo(path)
}
</script>

<template>
  <CustomInput
    id="locale-switcher"
    class="locale-switcher"
    type="select"
    :label="t('locale.switch')"
    hide-label
    :options="options"
    :model-value="locale"
    data-testid="locale-switcher"
    @update:model-value="onLocaleChange"
  />
</template>
