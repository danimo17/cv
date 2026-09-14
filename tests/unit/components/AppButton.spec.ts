import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppButton from '~/components/shared/AppButton.vue'

describe('AppButton', () => {
  it('renders a native button with the default classes', async () => {
    const wrapper = await mountSuspended(AppButton, { slots: { default: () => 'Click' } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toEqual(
      expect.arrayContaining([
        'app-button',
        'app-button--md',
        'app-button--solid',
        'app-button--primary',
      ])
    )
  })

  it('applies tone, size and variant modifiers', async () => {
    const wrapper = await mountSuspended(AppButton, {
      props: { tone: 'danger', size: 'lg', variant: 'outline' },
      slots: { default: () => 'Delete' },
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['app-button--danger', 'app-button--lg', 'app-button--outline'])
    )
    expect(wrapper.classes()).not.toContain('app-button--primary')
  })

  it('loading sets aria-busy and disables the button', async () => {
    const wrapper = await mountSuspended(AppButton, {
      props: { loading: true },
      slots: { default: () => 'Saving' },
    })
    const button = wrapper.find('button')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.classes()).toContain('app-button--loading')
  })

  it('external href renders a safe new-tab anchor', async () => {
    const wrapper = await mountSuspended(AppButton, {
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
    const wrapper = await mountSuspended(AppButton, {
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
    const wrapper = await mountSuspended(AppButton, {
      props: { to: '/meme' },
      slots: { default: () => 'Meme' },
    })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toContain('/meme')
  })

  it('renders the slot content', async () => {
    const wrapper = await mountSuspended(AppButton, { slots: { default: () => 'Hello there' } })
    expect(wrapper.text()).toContain('Hello there')
  })
})
