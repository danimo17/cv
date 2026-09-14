<script setup lang="ts">
import { experience } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('experience')
const { t } = useI18n()
</script>

<template>
  <AppSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="experience-section"
  >
    <ol class="experience-section__list">
      <li v-for="item in experience" :key="item.id">
        <ExperienceItem :item="item" variant="detailed" />
      </li>
    </ol>
  </AppSection>
</template>
