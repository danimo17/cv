<script setup lang="ts">
import { profile } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('contact')
const { t } = useI18n()
</script>

<template>
  <CustomSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="contact-section"
  >
    <CustomText as="p" variant="body" tone="muted" class="contact-section__intro">
      {{ t('contact.intro') }}
    </CustomText>
    <div class="contact-section__actions">
      <CustomButton :href="`mailto:${profile.email}`" icon="envelope">{{
        t('contact.email')
      }}</CustomButton>
      <CustomButton :href="profile.linkedin" variant="outline" icon="linkedin" icon-set="brands">
        {{ t('contact.linkedin') }}
      </CustomButton>
      <CustomButton :href="profile.github" variant="outline" icon="github" icon-set="brands">
        {{ t('contact.github') }}
      </CustomButton>
      <CvDownload variant="ghost" tone="neutral" />
    </div>
  </CustomSection>
</template>
