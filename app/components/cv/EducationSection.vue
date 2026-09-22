<script setup lang="ts">
const config = getSectionConfig('education')
const { t } = useI18n()
</script>

<template>
  <CustomSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="education-section"
  >
    <ol class="education-section__list">
      <li v-for="item in education" :key="item.id">
        <ExperienceItem :item="item" variant="compact" />
      </li>
    </ol>
    <CustomText as="h3" variant="h3" weight="semibold" class="education-section__subtitle">
      <CustomIcon name="certificate" size="sm" />
      {{ t('education.certifications') }}
    </CustomText>
    <ol class="education-section__list">
      <li v-for="item in certifications" :key="item.id">
        <ExperienceItem :item="item" variant="compact" />
      </li>
    </ol>
  </CustomSection>
</template>
