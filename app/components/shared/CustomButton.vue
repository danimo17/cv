<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: Tone
    size?: Size
    variant?: 'solid' | 'outline' | 'ghost'
    icon?: string
    iconSet?: 'solid' | 'brands'
    to?: string
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
      'custom-button',
      `custom-button--${size}`,
      `custom-button--${variant}`,
      `custom-button--${tone}`,
      { 'custom-button--loading': loading, 'custom-button--block': block },
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
    <CustomIcon v-if="icon" :name="icon" :set="iconSet" :size="size" class="custom-button__icon" />
    <slot />
  </component>
</template>
