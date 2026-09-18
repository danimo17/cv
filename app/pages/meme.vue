<script setup lang="ts">
import type { Meme } from '#shared/types/giphy'

const { t } = useI18n()
const hero = useHeroStore()
const giphy = useGiphyStore()

const candidate = ref<Meme | null>(null)
const justApplied = ref(false)

const steps = useMessageList('meme.how.steps')

const page = computed({
  get: () => Math.floor(giphy.offset / giphy.limit) + 1,
  set: (value: number) => {
    giphy.goToOffset((value - 1) * giphy.limit)
  },
})

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
      <CustomText as="p" variant="eyebrow" tone="primary" class="meme-page__kicker">
        {{ t('meme.kicker') }}
      </CustomText>
      <CustomText as="h1" variant="h1" class="meme-page__title">{{ t('meme.title') }}</CustomText>
      <CustomText as="p" variant="lead" tone="muted" class="meme-page__intro">
        {{ t('meme.intro') }}
      </CustomText>
    </header>

    <CustomCard variant="filled" padding="md" class="meme-page__how">
      <CustomText as="h2" variant="body" weight="semibold" class="meme-page__how-title">
        {{ t('meme.how.title') }}
      </CustomText>
      <ol class="meme-page__steps">
        <CustomText v-for="(step, i) in steps" :key="i" as="li" variant="small" tone="muted">
          {{ step }}
        </CustomText>
      </ol>
    </CustomCard>

    <CustomAlert
      v-if="justApplied"
      tone="success"
      :title="t('meme.success')"
      data-testid="meme-success"
    >
      <CustomButton size="sm" variant="outline" tone="success" icon="arrow-left" to="/">
        {{ t('meme.goHome') }}
      </CustomButton>
    </CustomAlert>
    <CustomAlert v-else-if="hero.hasMeme" tone="info">
      <CustomText as="span" variant="small">
        {{ t('meme.currently', { title: hero.selected?.title }) }}
      </CustomText>
      <CustomButton size="sm" variant="ghost" tone="info" icon="rotate-left" @click="hero.reset()">
        {{ t('hero.reset') }}
      </CustomButton>
    </CustomAlert>

    <MemeSearch :loading="giphy.status === 'pending'" :initial="giphy.query" @search="onSearch" />

    <MemePreview v-if="candidate" :meme="candidate" @use="wear" @cancel="candidate = null" />

    <MemeGrid
      :items="giphy.items"
      :status="giphy.status"
      :error-key="giphy.errorKey"
      :selected-id="candidate?.id ?? hero.selected?.id ?? null"
      @select="candidate = $event"
    />

    <CustomPagination v-model:page="page" :total="giphy.total" :per-page="giphy.limit" />

    <MemeRecentSearches :terms="giphy.history" @select="onSearch" />

    <CustomText as="p" variant="caption" tone="muted" class="meme-page__credit">
      {{ t('meme.poweredBy') }}
    </CustomText>
  </div>
</template>
