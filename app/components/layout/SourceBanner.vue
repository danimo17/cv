<script setup lang="ts">
import { profile } from '~/data/cv'

const COPIES = 4

const { t } = useI18n()
</script>

<template>
  <div class="source-banner" data-testid="source-banner">
    <CustomMarquee :label="t('banner.label')" speed="normal" tone="primary" size="sm">
      <template #default="{ duplicate }">
        <CustomText
          v-for="n in COPIES"
          :key="n"
          as="span"
          variant="small"
          weight="medium"
          class="source-banner__item"
        >
          <CustomIcon name="code" size="sm" class="source-banner__icon" />
          {{ t('banner.source') }}
          <CustomLink :href="profile.repo" variant="inline" :tabindex="duplicate ? -1 : undefined">
            {{ t('banner.repo') }}
          </CustomLink>
        </CustomText>
      </template>
    </CustomMarquee>
  </div>
</template>
