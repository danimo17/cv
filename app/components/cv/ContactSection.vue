<script setup lang="ts">
import { profile } from '~/data/cv'
import { getSectionConfig } from '~/ui-config/cv/sections'

const config = getSectionConfig('contact')
const { t } = useI18n()
</script>

<template>
  <AppSection
    :id="config.id"
    :title="t(config.titleKey)"
    :eyebrow="t(config.eyebrowKey)"
    :icon="config.icon"
    class="contact-section"
  >
    <AppText as="p" variant="body" tone="muted" class="contact-section__intro">
      {{ t('contact.intro') }}
    </AppText>
    <div class="contact-section__actions">
      <AppButton :href="`mailto:${profile.email}`" icon="envelope">{{
        t('contact.email')
      }}</AppButton>
      <AppButton :href="profile.linkedin" variant="outline" icon="linkedin" icon-set="brands">
        {{ t('contact.linkedin') }}
      </AppButton>
      <AppButton :href="profile.github" variant="outline" icon="github" icon-set="brands">
        {{ t('contact.github') }}
      </AppButton>
      <CvDownload variant="ghost" tone="neutral" />
    </div>
  </AppSection>
</template>
