<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    item: TimelineItem
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
    <CustomText as="p" variant="small" tone="muted" class="experience-item__period">
      <CustomText as="time" variant="small" :datetime="item.start">{{ period }}</CustomText>
    </CustomText>
    <div class="experience-item__body">
      <CustomText as="h3" variant="body" weight="semibold" class="experience-item__title">
        {{ t(`${key}.title`) }}
      </CustomText>
      <CustomText as="p" variant="body" tone="muted" class="experience-item__org">
        <CustomLink
          v-if="item.url"
          :href="item.url"
          variant="inline"
          class="experience-item__org-link"
        >
          {{ item.org }}
        </CustomLink>
        <CustomText v-else as="span" variant="body">{{ item.org }}</CustomText>
        <CustomText v-if="item.location" as="span" variant="small" tone="muted">
          {{ item.location }}
        </CustomText>
      </CustomText>
      <ul v-if="variant === 'detailed' && bullets.length" class="experience-item__bullets">
        <CustomText v-for="(bullet, i) in bullets" :key="i" as="li" variant="small" tone="muted">
          {{ bullet }}
        </CustomText>
      </ul>
      <CustomText
        v-else-if="note"
        as="p"
        variant="small"
        tone="muted"
        class="experience-item__note"
      >
        {{ note }}
      </CustomText>
      <ul v-if="item.tags.length" class="experience-item__tags" :aria-label="t('experience.tags')">
        <li v-for="tag in item.tags" :key="tag">
          <CustomBadge>{{ tag }}</CustomBadge>
        </li>
      </ul>
    </div>
  </article>
</template>
