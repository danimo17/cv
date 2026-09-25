<script setup lang="ts">
const { t } = useI18n()
const year = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <CustomText as="p" variant="small" tone="muted">
        {{ t('footer.copyright', { name: profile.name, year }) }}
        <CustomLink :href="profile.repo" variant="inline" class="app-footer__source">
          {{ t('footer.source') }}
        </CustomLink>
      </CustomText>
      <nav class="app-footer__links" :aria-label="t('contact.title')">
        <CustomLink
          :href="profile.github"
          variant="icon"
          class="app-footer__link"
          :aria-label="t('contact.github')"
        >
          <CustomIcon name="github" set="brands" />
        </CustomLink>
        <CustomLink
          :href="profile.linkedin"
          variant="icon"
          class="app-footer__link"
          :aria-label="t('contact.linkedin')"
        >
          <CustomIcon name="linkedin" set="brands" />
        </CustomLink>
        <CustomLink
          :href="`mailto:${profile.email}`"
          variant="icon"
          class="app-footer__link"
          :aria-label="t('contact.email')"
        >
          <CustomIcon name="envelope" />
        </CustomLink>
      </nav>
    </div>
  </footer>
</template>
