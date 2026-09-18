<script setup lang="ts">
import photo from '~/assets/img/daniel.jpg'

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
      <CustomText as="p" variant="lead" tone="muted" class="hero-section__greeting">
        {{ t('hero.greeting') }}
      </CustomText>
      <CustomText id="hero-title" as="h1" variant="display" class="hero-section__name">
        {{ profile.name }}
      </CustomText>
      <CustomText as="p" variant="h3" tone="primary" class="hero-section__headline">
        {{ t('hero.headline') }}
      </CustomText>
      <CustomText as="p" variant="body" tone="muted" class="hero-section__tagline">
        {{ t('hero.tagline') }}
      </CustomText>
      <div class="hero-section__meta">
        <CustomText as="span" variant="small" tone="muted" class="hero-section__meta-item">
          <CustomIcon name="location-dot" size="sm" />
          {{ t('hero.location') }}
        </CustomText>
        <CustomBadge tone="success" icon="circle-check">{{ t('hero.openToWork') }}</CustomBadge>
      </div>
      <div class="hero-section__actions">
        <CustomButton href="#contact" icon="envelope">{{ t('hero.cta.contact') }}</CustomButton>
        <CvDownload variant="outline" />
      </div>
    </div>
    <figure class="hero-section__figure">
      <CustomImage
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
      <CustomText as="figcaption" variant="small" tone="muted" class="hero-section__caption">
        <template v-if="hero.hasMeme">
          {{ t('hero.wearing') }} {{ hero.selected?.title }}
          <CustomButton
            size="sm"
            variant="ghost"
            tone="neutral"
            icon="rotate-left"
            data-testid="hero-reset"
            @click="hero.reset()"
          >
            {{ t('hero.reset') }}
          </CustomButton>
        </template>
        <CustomButton v-else size="sm" variant="ghost" icon="wand-magic-sparkles" to="/meme">
          {{ t('hero.tryMeme') }}
        </CustomButton>
      </CustomText>
    </figure>
  </section>
</template>
