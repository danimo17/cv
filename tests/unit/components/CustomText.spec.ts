import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CustomText from '~/components/shared/CustomText.vue'
import type { TextVariant } from '~/components/shared/CustomText.vue'

const VARIANTS: TextVariant[] = [
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'lead',
  'body',
  'small',
  'caption',
  'eyebrow',
]

describe('CustomText', () => {
  it('defaults to the body variant rendered as a p', async () => {
    const wrapper = await mountSuspended(CustomText, { slots: { default: () => 'Hello' } })
    expect(wrapper.element.tagName).toBe('P')
    expect(wrapper.classes()).toContain('custom-text')
    expect(wrapper.classes()).toContain('custom-text--body')
  })

  it.each(VARIANTS)('variant %s maps to its custom-text-- modifier class', async (variant) => {
    const wrapper = await mountSuspended(CustomText, {
      props: { variant },
      slots: { default: () => 'Hello' },
    })
    expect(wrapper.classes()).toContain(`custom-text--${variant}`)
  })

  it.each(['h4', 'h5', 'h6'] as const)(
    'heading variant %s can be paired with its matching semantic tag',
    async (variant) => {
      const wrapper = await mountSuspended(CustomText, {
        props: { as: variant, variant },
        slots: { default: () => 'Heading' },
      })
      expect(wrapper.element.tagName).toBe(variant.toUpperCase())
      expect(wrapper.classes()).toContain(`custom-text--${variant}`)
    }
  )
})
