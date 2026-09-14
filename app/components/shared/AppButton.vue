<script setup lang="ts">
import type { Size, Tone } from '~/types/ui'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    size?: Size
    variant?: 'solid' | 'outline' | 'ghost'
    icon?: string
    iconSet?: 'solid' | 'brands'
    /** Ruta interna (NuxtLinkLocale) */
    to?: string
    /** Enllaç extern o àncora */
    href?: string
    type?: 'button' | 'submit'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  {
    tone: 'primary',
    size: 'md',
    variant: 'solid',
    icon: '',
    iconSet: 'solid',
    to: '',
    href: '',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
  }
)

const NuxtLinkLocale = resolveComponent('NuxtLinkLocale')
const tag = computed(() => (props.to ? NuxtLinkLocale : props.href ? 'a' : 'button'))
const isButton = computed(() => tag.value === 'button')
const isExternal = computed(() => /^https?:\/\//.test(props.href))
const inactive = computed(() => props.disabled || props.loading)
</script>

<template>
  <component
    :is="tag"
    :class="[
      'app-button',
      `app-button--${size}`,
      `app-button--${variant}`,
      `app-button--${tone}`,
      { 'app-button--loading': loading, 'app-button--block': block },
    ]"
    :to="to || undefined"
    :href="href || undefined"
    :type="isButton ? type : undefined"
    :disabled="isButton && inactive ? true : undefined"
    :aria-disabled="!isButton && inactive ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
  >
    <AppIcon v-if="icon" :name="icon" :set="iconSet" :size="size" class="app-button__icon" />
    <slot />
  </component>
</template>
