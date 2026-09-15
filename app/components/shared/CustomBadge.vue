<script setup lang="ts">
import type { Size, Tone } from '~/types/ui'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    variant?: 'soft' | 'solid'
    size?: Size
    icon?: string
  }>(),
  { tone: 'neutral', variant: 'soft', size: 'sm', icon: '' }
)

// La tipografia (mida, pes) la posa CustomText; el badge només aporta fons, color i forma.
const textVariant = computed(() => (props.size === 'sm' ? 'caption' : 'small'))
</script>

<template>
  <CustomText
    as="span"
    :variant="textVariant"
    weight="medium"
    :class="[
      'custom-badge',
      `custom-badge--${size}`,
      `custom-badge--${variant}`,
      `custom-badge--${tone}`,
    ]"
  >
    <CustomIcon v-if="icon" :name="icon" size="sm" />
    <slot />
  </CustomText>
</template>
