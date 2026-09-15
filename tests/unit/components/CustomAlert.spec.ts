import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CustomAlert from '~/components/shared/CustomAlert.vue'
import { TONES } from '~/types/ui'

describe('CustomAlert', () => {
  it('defaults to the info tone with role status', async () => {
    const wrapper = await mountSuspended(CustomAlert, { slots: { default: () => 'Body' } })
    expect(wrapper.classes()).toContain('custom-alert')
    expect(wrapper.classes()).toContain('custom-alert--info')
    expect(wrapper.attributes('role')).toBe('status')
  })

  it.each(TONES)('tone %s maps to its custom-alert-- modifier class', async (tone) => {
    const wrapper = await mountSuspended(CustomAlert, {
      props: { tone },
      slots: { default: () => 'Body' },
    })
    expect(wrapper.classes()).toContain(`custom-alert--${tone}`)
  })

  it.each(['danger', 'warning'] as const)('tone %s uses role alert', async (tone) => {
    const wrapper = await mountSuspended(CustomAlert, {
      props: { tone },
      slots: { default: () => 'Body' },
    })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it.each(['primary', 'secondary', 'neutral', 'success', 'info'] as const)(
    'tone %s uses role status',
    async (tone) => {
      const wrapper = await mountSuspended(CustomAlert, {
        props: { tone },
        slots: { default: () => 'Body' },
      })
      expect(wrapper.attributes('role')).toBe('status')
    }
  )

  it('renders the title and the slot', async () => {
    const wrapper = await mountSuspended(CustomAlert, {
      props: { title: 'Heads up' },
      slots: { default: () => 'Body text' },
    })
    expect(wrapper.find('.custom-alert__title').text()).toBe('Heads up')
    expect(wrapper.find('.custom-alert__content').text()).toContain('Body text')
  })

  it('omits the title element when no title is given', async () => {
    const wrapper = await mountSuspended(CustomAlert, { slots: { default: () => 'Body' } })
    expect(wrapper.find('.custom-alert__title').exists()).toBe(false)
  })
})
