<script setup lang="ts">
import type { Component } from 'vue'
import AboutSection from '~/components/cv/AboutSection.vue'
import ContactSection from '~/components/cv/ContactSection.vue'
import EducationSection from '~/components/cv/EducationSection.vue'
import ExperienceSection from '~/components/cv/ExperienceSection.vue'
import TechStack from '~/components/cv/TechStack.vue'

const { t } = useI18n()

const SECTION_COMPONENTS: Record<HomeSectionConfig['component'], Component> = {
  AboutSection,
  ExperienceSection,
  TechStack,
  EducationSection,
  ContactSection,
}

useSeoMeta({
  title: t('meta.title'),
  description: t('meta.description'),
  ogTitle: t('meta.title'),
  ogDescription: t('meta.description'),
})
</script>

<template>
  <div class="page home-page">
    <HeroSection />
    <component
      :is="SECTION_COMPONENTS[section.component]"
      v-for="section in homeSections"
      :key="section.id"
    />
  </div>
</template>
