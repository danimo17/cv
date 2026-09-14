<script setup lang="ts">
import { profile } from '~/data/cv'

const COPIES = 4

const { t } = useI18n()
</script>

<template>
  <div class="source-banner" data-testid="source-banner">
    <AppMarquee :label="t('banner.label')" speed="normal" tone="primary" size="sm">
      <template #default="{ duplicate }">
        <AppText
          v-for="n in COPIES"
          :key="n"
          as="span"
          variant="small"
          weight="medium"
          class="source-banner__item"
        >
          <AppIcon name="code" size="sm" class="source-banner__icon" />
          {{ t('banner.source') }}
          <AppLink :href="profile.repo" variant="inline" :tabindex="duplicate ? -1 : undefined">
            {{ t('banner.repo') }}
          </AppLink>
        </AppText>
      </template>
    </AppMarquee>
  </div>
</template>
