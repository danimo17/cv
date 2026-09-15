<script setup lang="ts">
import { stack } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('stack')
const { t } = useI18n()
</script>

<template>
  <CustomSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="tech-stack"
  >
    <div class="tech-stack__groups">
      <div v-for="group in stack" :key="group.id" class="tech-stack__group">
        <CustomText as="h3" variant="body" weight="semibold" class="tech-stack__group-title">
          <CustomIcon :name="group.icon" size="sm" />
          {{ t(`stack.groups.${group.id}`) }}
        </CustomText>
        <ul class="tech-stack__list">
          <li v-for="tech in group.items" :key="tech">
            <CustomBadge size="md">{{ tech }}</CustomBadge>
          </li>
        </ul>
      </div>
    </div>
  </CustomSection>
</template>
