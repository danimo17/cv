import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { h } from 'vue'
import AppMarquee from '~/components/shared/AppMarquee.vue'

function mount(props: Record<string, unknown> = {}) {
  return mountSuspended(AppMarquee, {
    props: { label: 'Announcement', ...props },
    slots: {
      default: ({ duplicate }: { duplicate: boolean }) =>
        h('a', { href: '#x', tabindex: duplicate ? -1 : undefined }, 'Item'),
    },
  })
}

describe('AppMarquee', () => {
  it('renders the slot twice and hides the second copy from assistive tech', async () => {
    const wrapper = await mount()
    const copies = wrapper.findAll('.app-marquee__copy')
    expect(copies).toHaveLength(2)
    expect(copies[0]?.attributes('aria-hidden')).toBeUndefined()
    expect(copies[1]?.attributes('aria-hidden')).toBe('true')
    expect(copies[1]?.attributes('inert')).toBeDefined()
    expect(wrapper.findAll('a')).toHaveLength(2)
    expect(wrapper.attributes('aria-label')).toBe('Announcement')
  })

  it('tells the slot which copy is the duplicate so links can opt out of tabbing', async () => {
    const wrapper = await mount()
    const links = wrapper.findAll('a')
    expect(links[0]?.attributes('tabindex')).toBeUndefined()
    expect(links[1]?.attributes('tabindex')).toBe('-1')
  })

  it('applies the default speed, tone, size and pause modifiers', async () => {
    const wrapper = await mount()
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'app-marquee',
        'app-marquee--normal',
        'app-marquee--primary',
        'app-marquee--md',
        'app-marquee--pause',
      ])
    )
  })

  it('maps speed and tone props to modifier classes', async () => {
    const wrapper = await mount({ speed: 'fast', tone: 'success', size: 'sm' })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['app-marquee--fast', 'app-marquee--success', 'app-marquee--sm'])
    )
    expect(wrapper.classes()).not.toContain('app-marquee--normal')
  })

  it('drops the pause modifier when pauseOnHover is false', async () => {
    const wrapper = await mount({ pauseOnHover: false })
    expect(wrapper.classes()).not.toContain('app-marquee--pause')
  })
})
