<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: Tone
    variant?: 'soft' | 'solid'
    size?: Size
    icon?: string
  }>(),
  { tone: 'neutral', variant: 'soft', size: 'sm', icon: '' }
)

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
