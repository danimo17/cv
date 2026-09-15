<script setup lang="ts">
import type { Tone } from '~/types/ui'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    title?: string
    /** Sobreescriu la icona per defecte del tone */
    icon?: string
  }>(),
  { tone: 'info', title: '', icon: '' }
)

const DEFAULT_ICONS: Record<Tone, string> = {
  primary: 'circle-info',
  secondary: 'circle-info',
  neutral: 'circle-info',
  success: 'circle-check',
  info: 'circle-info',
  warning: 'triangle-exclamation',
  danger: 'circle-xmark',
}

const iconName = computed(() => props.icon || DEFAULT_ICONS[props.tone])
const role = computed(() =>
  props.tone === 'danger' || props.tone === 'warning' ? 'alert' : 'status'
)
</script>

<template>
  <div :class="['custom-alert', `custom-alert--${tone}`]" :role="role">
    <CustomIcon :name="iconName" class="custom-alert__icon" />
    <div class="custom-alert__body">
      <CustomText v-if="title" as="p" variant="small" weight="semibold" class="custom-alert__title">
        {{ title }}
      </CustomText>
      <div class="custom-alert__content"><slot /></div>
    </div>
  </div>
</template>
