<script setup lang="ts">
const COPIES = 4

const { t } = useI18n()
</script>

<template>
  <div class="source-banner" data-testid="source-banner">
    <CustomMarquee :label="t('banner.label')" speed="normal" tone="primary" size="sm">
      <template #default="{ duplicate }">
        <CustomLink
          v-for="n in COPIES"
          :key="n"
          :href="profile.repo"
          variant="inline"
          class="source-banner__item"
          :tabindex="duplicate ? -1 : undefined"
        >
          <CustomIcon name="code" size="sm" class="source-banner__icon" />
          <CustomText as="span" variant="small" weight="medium">
            {{ t('banner.source') }} {{ t('banner.repo') }}
          </CustomText>
        </CustomLink>
      </template>
    </CustomMarquee>
  </div>
</template>
