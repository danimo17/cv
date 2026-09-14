<script setup lang="ts">
import type { Meme } from '#shared/types/giphy'

const { t } = useI18n()
const hero = useHeroStore()
const giphy = useGiphyStore()

/** Meme en previsualització (encara no aplicat) */
const candidate = ref<Meme | null>(null)
const justApplied = ref(false)

const steps = useMessageList('meme.how.steps')

function onSearch(q: string) {
  candidate.value = null
  justApplied.value = false
  giphy.search(q)
}

function wear(meme: Meme) {
  hero.select(meme)
  candidate.value = null
  justApplied.value = true
}

useSeoMeta({ title: t('meta.memeTitle'), description: t('meta.memeDescription') })
</script>

<template>
  <div class="page meme-page">
    <header class="meme-page__header">
      <AppText as="p" variant="eyebrow" tone="primary" class="meme-page__kicker">
        {{ t('meme.kicker') }}
      </AppText>
      <AppText as="h1" variant="h1" class="meme-page__title">{{ t('meme.title') }}</AppText>
      <AppText as="p" variant="lead" tone="muted" class="meme-page__intro">
        {{ t('meme.intro') }}
      </AppText>
    </header>

    <AppCard variant="filled" padding="md" class="meme-page__how">
      <AppText as="h2" variant="body" weight="semibold" class="meme-page__how-title">
        {{ t('meme.how.title') }}
      </AppText>
      <ol class="meme-page__steps">
        <AppText v-for="(step, i) in steps" :key="i" as="li" variant="small" tone="muted">
          {{ step }}
        </AppText>
      </ol>
    </AppCard>

    <AppAlert
      v-if="justApplied"
      tone="success"
      :title="t('meme.success')"
      data-testid="meme-success"
    >
      <AppButton size="sm" variant="outline" tone="success" icon="arrow-left" to="/">
        {{ t('meme.goHome') }}
      </AppButton>
    </AppAlert>
    <AppAlert v-else-if="hero.hasMeme" tone="info">
      <AppText as="span" variant="small">
        {{ t('meme.currently', { title: hero.selected?.title }) }}
      </AppText>
      <AppButton size="sm" variant="ghost" tone="info" icon="rotate-left" @click="hero.reset()">
        {{ t('hero.reset') }}
      </AppButton>
    </AppAlert>

    <MemeSearch :loading="giphy.status === 'pending'" :initial="giphy.query" @search="onSearch" />

    <MemePreview v-if="candidate" :meme="candidate" @use="wear" @cancel="candidate = null" />

    <MemeGrid
      :items="giphy.items"
      :status="giphy.status"
      :error-key="giphy.errorKey"
      :selected-id="candidate?.id ?? hero.selected?.id ?? null"
      @select="candidate = $event"
    />

    <AppText as="p" variant="caption" tone="muted" class="meme-page__credit">
      {{ t('meme.poweredBy') }}
    </AppText>
  </div>
</template>
