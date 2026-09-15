import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CustomButton from '~/components/shared/CustomButton.vue'

describe('CustomButton', () => {
  it('renders a native button with the default classes', async () => {
    const wrapper = await mountSuspended(CustomButton, { slots: { default: () => 'Click' } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toEqual(
      expect.arrayContaining([
        'custom-button',
        'custom-button--md',
        'custom-button--solid',
        'custom-button--primary',
      ])
    )
  })

  it('applies tone, size and variant modifiers', async () => {
    const wrapper = await mountSuspended(CustomButton, {
      props: { tone: 'danger', size: 'lg', variant: 'outline' },
      slots: { default: () => 'Delete' },
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'custom-button--danger',
        'custom-button--lg',
        'custom-button--outline',
      ])
    )
    expect(wrapper.classes()).not.toContain('custom-button--primary')
  })

  it('loading sets aria-busy and disables the button', async () => {
    const wrapper = await mountSuspended(CustomButton, {
      props: { loading: true },
      slots: { default: () => 'Saving' },
    })
    const button = wrapper.find('button')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('custom-button--loading')
  })

  it('external href renders a safe new-tab anchor', async () => {
    const wrapper = await mountSuspended(CustomButton, {
      props: { href: 'https://example.com' },
      slots: { default: () => 'Site' },
    })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(a.attributes('href')).toBe('https://example.com')
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
    expect(a.attributes('type')).toBeUndefined()
  })

  it('anchor href renders a plain anchor without target', async () => {
    const wrapper = await mountSuspended(CustomButton, {
      props: { href: '#contact' },
      slots: { default: () => 'Contact' },
    })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe('#contact')
    expect(a.attributes('target')).toBeUndefined()
    expect(a.attributes('rel')).toBeUndefined()
  })

  it('to renders a localised router link', async () => {
    const wrapper = await mountSuspended(CustomButton, {
      props: { to: '/meme' },
      slots: { default: () => 'Meme' },
    })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toContain('/meme')
  })

  it('renders the slot content', async () => {
    const wrapper = await mountSuspended(CustomButton, { slots: { default: () => 'Hello there' } })
    expect(wrapper.text()).toContain('Hello there')
  })
})
