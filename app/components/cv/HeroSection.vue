<script setup lang="ts">
import photo from '~/assets/img/daniel.jpg'
import { profile } from '~/data/cv'

const { t } = useI18n()
const hero = useHeroStore()

const image = computed(() => hero.selected?.full ?? photo)
const alt = computed(() =>
  hero.selected ? hero.selected.title || t('hero.memeAlt') : t('hero.photoAlt')
)
</script>

<template>
  <section class="hero-section" aria-labelledby="hero-title">
    <div class="hero-section__content">
      <AppText as="p" variant="lead" tone="muted" class="hero-section__greeting">
        {{ t('hero.greeting') }}
      </AppText>
      <AppText id="hero-title" as="h1" variant="display" class="hero-section__name">
        {{ profile.name }}
      </AppText>
      <AppText as="p" variant="h3" tone="primary" class="hero-section__headline">
        {{ t('hero.headline') }}
      </AppText>
      <AppText as="p" variant="body" tone="muted" class="hero-section__tagline">
        {{ t('hero.tagline') }}
      </AppText>
      <div class="hero-section__meta">
        <AppText as="span" variant="small" tone="muted" class="hero-section__meta-item">
          <AppIcon name="location-dot" size="sm" />
          {{ t('hero.location') }}
        </AppText>
        <AppBadge tone="success" icon="circle-check">{{ t('hero.openToWork') }}</AppBadge>
      </div>
      <div class="hero-section__actions">
        <AppButton href="#contact" icon="envelope">{{ t('hero.cta.contact') }}</AppButton>
        <CvDownload variant="outline" />
      </div>
    </div>
    <figure class="hero-section__figure">
      <AppImage
        :src="image"
        :alt="alt"
        :class="['hero-section__image', { 'hero-section__image--meme': hero.hasMeme }]"
        width="800"
        height="800"
        loading="eager"
        radius="xl"
        frame
        fetchpriority="high"
        data-testid="hero-image"
      />
      <AppText as="figcaption" variant="small" tone="muted" class="hero-section__caption">
        <template v-if="hero.hasMeme">
          {{ t('hero.wearing') }} {{ hero.selected?.title }}
          <AppButton
            size="sm"
            variant="ghost"
            tone="neutral"
            icon="rotate-left"
            data-testid="hero-reset"
            @click="hero.reset()"
          >
            {{ t('hero.reset') }}
          </AppButton>
        </template>
        <AppButton v-else size="sm" variant="ghost" icon="wand-magic-sparkles" to="/meme">
          {{ t('hero.tryMeme') }}
        </AppButton>
      </AppText>
    </figure>
  </section>
</template>
