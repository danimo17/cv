<script setup lang="ts">
import { profile } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('about')
const { t } = useI18n()
</script>

<template>
  <AppSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="about-section"
  >
    <div class="about-section__grid">
      <div class="about-section__text">
        <AppText as="p" variant="body" tone="muted">{{ t('about.p1') }}</AppText>
        <AppText as="p" variant="body" tone="muted">{{ t('about.p2') }}</AppText>
      </div>
      <div class="about-section__aside">
        <div>
          <AppText as="h3" variant="eyebrow" tone="muted" class="about-section__aside-title">
            {{ t('about.languages') }}
          </AppText>
          <ul class="about-section__list">
            <li v-for="code in profile.languages" :key="code">
              <AppBadge icon="language" size="md">{{ t(`about.lang.${code}`) }}</AppBadge>
            </li>
          </ul>
        </div>
        <div>
          <AppText as="h3" variant="eyebrow" tone="muted" class="about-section__aside-title">
            {{ t('about.interests') }}
          </AppText>
          <ul class="about-section__list">
            <li v-for="id in profile.interests" :key="id">
              <AppBadge tone="primary" size="md">{{ t(`about.interest.${id}`) }}</AppBadge>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </AppSection>
</template>
