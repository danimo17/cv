<script setup lang="ts">
const config = getSectionConfig('about')
const { t } = useI18n()
</script>

<template>
  <CustomSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="about-section"
  >
    <div class="about-section__grid">
      <div class="about-section__text">
        <CustomText as="p" variant="body" tone="muted">{{ t('about.p1') }}</CustomText>
        <CustomText as="p" variant="body" tone="muted">{{ t('about.p2') }}</CustomText>
      </div>
      <div class="about-section__aside">
        <div>
          <CustomText as="h3" variant="eyebrow" tone="muted" class="about-section__aside-title">
            {{ t('about.languages') }}
          </CustomText>
          <ul class="about-section__list">
            <li v-for="code in profile.languages" :key="code">
              <CustomBadge icon="language" size="md">{{ t(`about.lang.${code}`) }}</CustomBadge>
            </li>
          </ul>
        </div>
        <div>
          <CustomText as="h3" variant="eyebrow" tone="muted" class="about-section__aside-title">
            {{ t('about.interests') }}
          </CustomText>
          <ul class="about-section__list">
            <li v-for="id in profile.interests" :key="id">
              <CustomBadge tone="primary" size="md">{{ t(`about.interest.${id}`) }}</CustomBadge>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </CustomSection>
</template>
