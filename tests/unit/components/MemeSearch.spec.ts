import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MemeSearch from '~/components/meme/MemeSearch.vue'

describe('MemeSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits the trimmed query 1.5s after the user stops typing', async () => {
    const wrapper = await mountSuspended(MemeSearch)
    const input = wrapper.find('input')
    await input.setValue('  cat  ')
    await vi.advanceTimersByTimeAsync(1500)
    expect(wrapper.emitted('search')).toEqual([['cat']])
  })

  it('does not emit for a blank query', async () => {
    const wrapper = await mountSuspended(MemeSearch)
    const input = wrapper.find('input')
    await input.setValue('   ')
    await vi.advanceTimersByTimeAsync(1500)
    expect(wrapper.emitted('search')).toBeUndefined()
  })

  it('resets the timer on every keystroke, only emitting once typing settles', async () => {
    const wrapper = await mountSuspended(MemeSearch)
    const input = wrapper.find('input')
    await input.setValue('c')
    await vi.advanceTimersByTimeAsync(1000)
    await input.setValue('ca')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.emitted('search')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.emitted('search')).toEqual([['ca']])
  })

  it('does not emit after the component is unmounted', async () => {
    const wrapper = await mountSuspended(MemeSearch)
    const input = wrapper.find('input')
    await input.setValue('cat')
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(1500)
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
