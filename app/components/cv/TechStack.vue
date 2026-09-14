<script setup lang="ts">
import { stack } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('stack')
const { t } = useI18n()
</script>

<template>
  <AppSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="tech-stack"
  >
    <div class="tech-stack__groups">
      <div v-for="group in stack" :key="group.id" class="tech-stack__group">
        <AppText as="h3" variant="body" weight="semibold" class="tech-stack__group-title">
          <AppIcon :name="group.icon" size="sm" />
          {{ t(`stack.groups.${group.id}`) }}
        </AppText>
        <ul class="tech-stack__list">
          <li v-for="tech in group.items" :key="tech">
            <AppBadge size="md">{{ tech }}</AppBadge>
          </li>
        </ul>
      </div>
    </div>
  </AppSection>
</template>
