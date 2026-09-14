import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Meme } from '#shared/types/giphy'
import MemeCard from '~/components/meme/MemeCard.vue'

const meme: Meme = {
  id: 'm1',
  title: 'Cat typing',
  preview: 'https://example.test/p.gif',
  full: 'https://example.test/f.gif',
  width: 480,
  height: 480,
}

describe('MemeCard', () => {
  it('emits select with the meme on click', async () => {
    const wrapper = await mountSuspended(MemeCard, { props: { meme } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]).toEqual([meme])
  })

  it('renders the preview image with the title as alt', async () => {
    const wrapper = await mountSuspended(MemeCard, { props: { meme } })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(meme.preview)
    expect(img.attributes('alt')).toBe(meme.title)
    expect(wrapper.find('[data-testid="meme-card"]').exists()).toBe(true)
  })

  it('is not pressed by default', async () => {
    const wrapper = await mountSuspended(MemeCard, { props: { meme } })
    const button = wrapper.find('button')
    expect(button.classes()).not.toContain('meme-card--selected')
    expect(button.attributes('aria-pressed')).toBe('false')
  })

  it('selected adds the modifier class and aria-pressed', async () => {
    const wrapper = await mountSuspended(MemeCard, { props: { meme, selected: true } })
    const button = wrapper.find('button')
    expect(button.classes()).toContain('meme-card--selected')
    expect(button.attributes('aria-pressed')).toBe('true')
  })
})
