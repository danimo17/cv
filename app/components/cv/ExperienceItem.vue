<script setup lang="ts">
import { formatPeriod } from '~/domain/cv/period'
import type { TimelineItem } from '~/domain/cv/types'

const props = withDefaults(
  defineProps<{
    item: TimelineItem
    /** `detailed` mostra els bullets; `compact` mostra la nota (formació, certificats) */
    variant?: 'detailed' | 'compact'
  }>(),
  { variant: 'detailed' }
)

const { t, te, locale } = useI18n()

const key = computed(() => `${props.item.section}.items.${props.item.id}`)
const period = computed(() =>
  formatPeriod(props.item.start, props.item.end, locale.value, t('experience.present'))
)
const bullets = useMessageList(() => `${key.value}.bullets`)
const note = computed(() => (te(`${key.value}.note`) ? t(`${key.value}.note`) : ''))
</script>

<template>
  <article :class="['experience-item', `experience-item--${variant}`]">
    <AppText as="p" variant="small" tone="muted" class="experience-item__period">
      <AppText as="time" variant="small" :datetime="item.start">{{ period }}</AppText>
    </AppText>
    <div class="experience-item__body">
      <AppText as="h3" variant="body" weight="semibold" class="experience-item__title">
        {{ t(`${key}.title`) }}
      </AppText>
      <AppText as="p" variant="body" tone="muted" class="experience-item__org">
        <AppLink
          v-if="item.url"
          :href="item.url"
          variant="inline"
          class="experience-item__org-link"
        >
          {{ item.org }}
        </AppLink>
        <AppText v-else as="span" variant="body">{{ item.org }}</AppText>
        <AppText v-if="item.location" as="span" variant="small" tone="muted">
          {{ item.location }}
        </AppText>
      </AppText>
      <ul v-if="variant === 'detailed' && bullets.length" class="experience-item__bullets">
        <AppText v-for="(bullet, i) in bullets" :key="i" as="li" variant="small" tone="muted">
          {{ bullet }}
        </AppText>
      </ul>
      <AppText v-else-if="note" as="p" variant="small" tone="muted" class="experience-item__note">
        {{ note }}
      </AppText>
      <ul v-if="item.tags.length" class="experience-item__tags" :aria-label="t('experience.tags')">
        <li v-for="tag in item.tags" :key="tag">
          <AppBadge>{{ tag }}</AppBadge>
        </li>
      </ul>
    </div>
  </article>
</template>
