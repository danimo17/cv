import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MemeSearch from '~/components/meme/MemeSearch.vue'

describe('MemeSearch', () => {
  it('emits the trimmed query on submit', async () => {
    const wrapper = await mountSuspended(MemeSearch)
    const input = wrapper.find('input')
    await input.setValue('  cat  ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')).toEqual([['cat']])
  })

  it('does not emit for a blank query', async () => {
    const wrapper = await mountSuspended(MemeSearch)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')).toBeUndefined()
  })

  it('re-syncs the field when `initial` changes after mount (e.g. a recent search click)', async () => {
    const wrapper = await mountSuspended(MemeSearch, { props: { initial: 'cat' } })
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('cat')

    await wrapper.setProps({ initial: 'dog' })
    expect((input.element as HTMLInputElement).value).toBe('dog')
  })
})
