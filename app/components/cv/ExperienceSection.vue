<script setup lang="ts">
const config = getSectionConfig('experience')
const { t } = useI18n()
</script>

<template>
  <CustomSection
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
  </CustomSection>
</template>
