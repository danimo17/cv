<script setup lang="ts">
import { certifications, education } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('education')
const { t } = useI18n()
</script>

<template>
  <AppSection
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
    <AppText as="h3" variant="lead" weight="semibold" class="education-section__subtitle">
      <AppIcon name="certificate" size="sm" />
      {{ t('education.certifications') }}
    </AppText>
    <ol class="education-section__list">
      <li v-for="item in certifications" :key="item.id">
        <ExperienceItem :item="item" variant="compact" />
      </li>
    </ol>
  </AppSection>
</template>
