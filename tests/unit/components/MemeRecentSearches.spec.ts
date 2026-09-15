import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MemeRecentSearches from '~/components/meme/MemeRecentSearches.vue'

describe('MemeRecentSearches', () => {
  it('renders nothing when there is no history', async () => {
    const wrapper = await mountSuspended(MemeRecentSearches, { props: { terms: [] } })
    expect(wrapper.find('[data-testid="meme-recent-searches"]').exists()).toBe(false)
  })

  it('renders up to 5 terms as clickable buttons, most recent first', async () => {
    const terms = ['cat', 'dog', 'bird']
    const wrapper = await mountSuspended(MemeRecentSearches, { props: { terms } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.map((b) => b.text())).toEqual(terms)
  })

  it('emits select with the clicked term', async () => {
    const wrapper = await mountSuspended(MemeRecentSearches, {
      props: { terms: ['cat', 'dog'] },
    })
    const buttons = wrapper.findAll('button')
    await buttons[1]?.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['dog']])
  })
})
