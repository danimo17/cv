<script setup lang="ts">
import { profile } from '~/data/cv'

const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <AppText as="p" variant="small" tone="muted">
        {{ t('footer.built') }}
        <AppLink :href="profile.repo" variant="inline" class="app-footer__source">
          {{ t('footer.source') }}
        </AppLink>
      </AppText>
      <nav class="app-footer__links" :aria-label="t('contact.title')">
        <AppLink
          :href="profile.github"
          variant="icon"
          class="app-footer__link"
          :aria-label="t('contact.github')"
        >
          <AppIcon name="github" set="brands" />
        </AppLink>
        <AppLink
          :href="profile.linkedin"
          variant="icon"
          class="app-footer__link"
          :aria-label="t('contact.linkedin')"
        >
          <AppIcon name="linkedin" set="brands" />
        </AppLink>
        <AppLink
          :href="`mailto:${profile.email}`"
          variant="icon"
          class="app-footer__link"
          :aria-label="t('contact.email')"
        >
          <AppIcon name="envelope" />
        </AppLink>
      </nav>
    </div>
  </footer>
</template>
