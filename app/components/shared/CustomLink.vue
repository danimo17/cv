<script setup lang="ts">
export type LinkVariant = 'inline' | 'nav' | 'subtle' | 'icon'
export type LinkTone = 'default' | Tone

const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: LinkVariant
    tone?: LinkTone
    activeClass?: string
    download?: boolean | string
    localize?: boolean
  }>(),
  {
    to: '',
    href: '',
    variant: 'inline',
    tone: 'default',
    activeClass: 'custom-link--active',
    download: undefined,
    localize: true,
  }
)

const NuxtLinkLocale = resolveComponent('NuxtLinkLocale')
const NuxtLink = resolveComponent('NuxtLink')
const tag = computed(() => (props.to ? (props.localize ? NuxtLinkLocale : NuxtLink) : 'a'))
const isExternal = computed(() => /^https?:\/\//.test(props.href))
</script>

<template>
  <component
    :is="tag"
    :class="['custom-link', `custom-link--${variant}`, `custom-link--tone-${tone}`]"
    :to="to || undefined"
    :href="to ? undefined : href || undefined"
    :active-class="to ? activeClass : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :download="download"
  >
    <slot />
  </component>
</template>
