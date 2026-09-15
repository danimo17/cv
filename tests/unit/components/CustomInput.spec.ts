import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CustomInput from '~/components/shared/CustomInput.vue'

const OPTIONS = [
  { value: 'vue', label: 'Vue' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 3, label: 'Three' },
]

describe('CustomInput', () => {
  it('text: renders a labelled input and round-trips v-model', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'q', label: 'Query', modelValue: 'cat' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('q')
    expect(input.attributes('type')).toBe('text')
    expect(wrapper.find('label').attributes('for')).toBe('q')
    expect(wrapper.find('label').text()).toBe('Query')
    expect(wrapper.classes()).toContain('custom-input--text')
    expect((input.element as HTMLInputElement).value).toBe('cat')

    await input.setValue('dog')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['dog'])
  })

  it('search: forwards the type and the icon modifier', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'q', label: 'Query', type: 'search', icon: 'magnifying-glass', hideLabel: true },
    })
    expect(wrapper.find('input').attributes('type')).toBe('search')
    expect(wrapper.classes()).toContain('custom-input--with-icon')
    expect(wrapper.find('label').classes()).toContain('sr-only')
  })

  it('select: renders the options and emits the chosen (typed) value', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'fw', label: 'Framework', type: 'select', options: OPTIONS, modelValue: 'vue' },
    })
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
    expect(select.findAll('option').map((o) => o.text())).toEqual(['Vue', 'Nuxt', 'Three'])
    expect(wrapper.classes()).toContain('custom-input--select')

    await select.setValue('nuxt')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['nuxt'])

    await select.setValue('3')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])
  })

  it('checkbox: emits a boolean', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'ok', label: 'Agree', type: 'checkbox', modelValue: false },
    })
    const box = wrapper.find('input[type="checkbox"]')
    expect(box.exists()).toBe(true)
    expect(wrapper.find('label').attributes('for')).toBe('ok')

    await box.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
  })

  it('radio: renders a fieldset with legend and emits the chosen value', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'fw', label: 'Framework', type: 'radio', options: OPTIONS, modelValue: 'vue' },
    })
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.find('legend').text()).toBe('Framework')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    expect(radios.every((r) => r.attributes('name') === 'fw')).toBe(true)
    expect((radios[0]?.element as HTMLInputElement).checked).toBe(true)

    await radios[1]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['nuxt'])
  })

  it('number: emits a number (and null when cleared)', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'n', label: 'Amount', type: 'number', min: 0, max: 10, step: 2, modelValue: 4 },
    })
    const input = wrapper.find('input[type="number"]')
    expect(input.attributes('min')).toBe('0')
    expect(input.attributes('max')).toBe('10')
    expect(input.attributes('step')).toBe('2')

    await input.setValue('8')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([8])

    await input.setValue('')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('textarea: renders rows and round-trips the text', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'msg', label: 'Message', type: 'textarea', rows: 6, modelValue: 'hi' },
    })
    const area = wrapper.find('textarea')
    expect(area.attributes('rows')).toBe('6')
    await area.setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['hello'])
  })

  it('danger tone sets aria-invalid and the hint is linked', async () => {
    const wrapper = await mountSuspended(CustomInput, {
      props: { id: 'q', label: 'Query', tone: 'danger', hint: 'Required' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('q-hint')
    expect(wrapper.find('#q-hint').text()).toBe('Required')
    expect(wrapper.classes()).toContain('custom-input--danger')
  })
})
