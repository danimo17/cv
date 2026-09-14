<script setup lang="ts">
import type { Tone } from '~/types/ui'

export type LinkVariant = 'inline' | 'nav' | 'subtle' | 'icon'
export type LinkTone = 'default' | Tone

// Únic embolcall d'enllaços (decisió 026): `to` → NuxtLinkLocale, `href` → <a>.
const props = withDefaults(
  defineProps<{
    /** Ruta interna; es localitza (NuxtLinkLocale) llevat que `localize` sigui false */
    to?: string
    /** URL externa (`https?://` → nova pestanya segura), àncora `#id` o `mailto:` */
    href?: string
    variant?: LinkVariant
    tone?: LinkTone
    /** Classe afegida quan la ruta és activa (només amb `to`) */
    activeClass?: string
    /** Passa-ho a `<a download>` */
    download?: boolean | string
    /** `false` → NuxtLink sense prefix de locale (p. ex. rutes ja localitzades) */
    localize?: boolean
  }>(),
  {
    to: '',
    href: '',
    variant: 'inline',
    tone: 'default',
    activeClass: 'app-link--active',
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
    :class="['app-link', `app-link--${variant}`, `app-link--tone-${tone}`]"
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
