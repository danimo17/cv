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

// La tipografia (mida, pes) la posa AppText; el badge només aporta fons, color i forma.
const textVariant = computed(() => (props.size === 'sm' ? 'caption' : 'small'))
</script>

<template>
  <AppText
    as="span"
    :variant="textVariant"
    weight="medium"
    :class="['app-badge', `app-badge--${size}`, `app-badge--${variant}`, `app-badge--${tone}`]"
  >
    <AppIcon v-if="icon" :name="icon" size="sm" />
    <slot />
  </AppText>
</template>
