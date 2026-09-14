import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppAlert from '~/components/shared/AppAlert.vue'
import { TONES } from '~/types/ui'

describe('AppAlert', () => {
  it('defaults to the info tone with role status', async () => {
    const wrapper = await mountSuspended(AppAlert, { slots: { default: () => 'Body' } })
    expect(wrapper.classes()).toContain('app-alert')
    expect(wrapper.classes()).toContain('app-alert--info')
    expect(wrapper.attributes('role')).toBe('status')
  })

  it.each(TONES)('tone %s maps to its app-alert-- modifier class', async (tone) => {
    const wrapper = await mountSuspended(AppAlert, {
      props: { tone },
      slots: { default: () => 'Body' },
    })
    expect(wrapper.classes()).toContain(`app-alert--${tone}`)
  })

  it.each(['danger', 'warning'] as const)('tone %s uses role alert', async (tone) => {
    const wrapper = await mountSuspended(AppAlert, {
      props: { tone },
      slots: { default: () => 'Body' },
    })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it.each(['primary', 'secondary', 'neutral', 'success', 'info'] as const)(
    'tone %s uses role status',
    async (tone) => {
      const wrapper = await mountSuspended(AppAlert, {
        props: { tone },
        slots: { default: () => 'Body' },
      })
      expect(wrapper.attributes('role')).toBe('status')
    }
  )

  it('renders the title and the slot', async () => {
    const wrapper = await mountSuspended(AppAlert, {
      props: { title: 'Heads up' },
      slots: { default: () => 'Body text' },
    })
    expect(wrapper.find('.app-alert__title').text()).toBe('Heads up')
    expect(wrapper.find('.app-alert__content').text()).toContain('Body text')
  })

  it('omits the title element when no title is given', async () => {
    const wrapper = await mountSuspended(AppAlert, { slots: { default: () => 'Body' } })
    expect(wrapper.find('.app-alert__title').exists()).toBe(false)
  })
})
