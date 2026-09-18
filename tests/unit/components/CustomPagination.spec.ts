import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CustomPagination from '~/components/shared/CustomPagination.vue'

describe('CustomPagination', () => {
  it('renders nothing when everything fits on a single page', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 1, total: 10, perPage: 12 },
    })
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('computes the page count from total and perPage', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 1, total: 25, perPage: 12 },
    })
    // ceil(25 / 12) = 3
    expect(wrapper.text()).toContain('3')
  })

  it('disables the previous button on the first page', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 1, total: 25, perPage: 12 },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]?.attributes('disabled')).toBeDefined()
    expect(buttons[1]?.attributes('disabled')).toBeUndefined()
  })

  it('disables the next button on the last page', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 3, total: 25, perPage: 12 },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0]?.attributes('disabled')).toBeUndefined()
    expect(buttons[1]?.attributes('disabled')).toBeDefined()
  })

  it('emits update:page with the next page when clicking next', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 1, total: 25, perPage: 12 },
    })
    const buttons = wrapper.findAll('button')
    await buttons[1]?.trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[2]])
  })

  it('emits update:page with the previous page when clicking previous', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 2, total: 25, perPage: 12 },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0]?.trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[1]])
  })

  it('does not emit when clicking a disabled edge', async () => {
    const wrapper = await mountSuspended(CustomPagination, {
      props: { page: 1, total: 25, perPage: 12 },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0]?.trigger('click')
    expect(wrapper.emitted('update:page')).toBeUndefined()
  })
})
