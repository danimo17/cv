<script setup lang="ts" generic="T extends InputValue">
import type { Ref } from 'vue'
import type { Size } from '~/types/ui'

export type InputValue = string | number | boolean | Array<string | number> | null
export type InputType =
  | 'text'
  | 'search'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
export interface InputOption {
  value: string | number
  label: string
  disabled?: boolean
}

// Únic embolcall de formularis (decisió 026): només elements natius, sense llibreries.
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    type?: InputType
    /** Opcions per a `select`, `multiselect` i `radio` */
    options?: InputOption[]
    placeholder?: string
    icon?: string
    size?: Size
    tone?: 'neutral' | 'danger'
    hint?: string
    hideLabel?: boolean
    disabled?: boolean
    required?: boolean
    /** Files del `textarea` */
    rows?: number
    min?: number
    max?: number
    step?: number
    /** Nom del grup de `radio` (per defecte l'`id`) */
    name?: string
  }>(),
  {
    type: 'text',
    options: () => [],
    placeholder: '',
    icon: '',
    size: 'md',
    tone: 'neutral',
    hint: '',
    hideLabel: false,
    disabled: false,
    required: false,
    rows: 4,
    min: undefined,
    max: undefined,
    step: undefined,
    name: '',
  }
)

// eslint-disable-next-line vue/require-default-prop -- el default depèn del tipus genèric T
const model = defineModel<T>()
/** Vista no genèrica del model per escriure-hi des dels handlers natius. */
const raw = model as Ref<InputValue | undefined>

const TEXT_TYPES = new Set<InputType>(['text', 'search', 'email'])
const isText = computed(() => TEXT_TYPES.has(props.type))
const hintId = computed(() => (props.hint ? `${props.id}-hint` : undefined))
const invalid = computed(() => (props.tone === 'danger' ? 'true' : undefined))
const groupName = computed(() => props.name || props.id)

/** Únic punt on el valor natiu torna al model tipat. */
function set(value: InputValue) {
  raw.value = value
}

function onText(event: Event) {
  set((event.target as HTMLInputElement | HTMLTextAreaElement).value)
}

function onNumber(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  set(raw === '' ? null : Number(raw))
}

function optionValue(raw: string): string | number {
  const found = props.options.find((option) => String(option.value) === raw)
  return found ? found.value : raw
}

function onSelect(event: Event) {
  set(optionValue((event.target as HTMLSelectElement).value))
}

function onMultiselect(event: Event) {
  const selected = Array.from((event.target as HTMLSelectElement).selectedOptions)
  set(selected.map((option) => optionValue(option.value)))
}

function onCheckbox(event: Event) {
  set((event.target as HTMLInputElement).checked)
}

function isSelected(value: string | number): boolean {
  return Array.isArray(model.value) ? model.value.includes(value) : model.value === value
}

const stringValue = computed(() =>
  model.value === null || model.value === undefined ? '' : String(model.value)
)
</script>

<template>
  <div
    :class="[
      'custom-input',
      `custom-input--${type}`,
      `custom-input--${size}`,
      `custom-input--${tone}`,
      { 'custom-input--with-icon': icon && isText, 'custom-input--disabled': disabled },
    ]"
  >
    <!-- radio: fieldset + legend -->
    <fieldset
      v-if="type === 'radio'"
      class="custom-input__group"
      :disabled="disabled"
      :aria-describedby="hintId"
      :aria-invalid="invalid"
      :aria-required="required || undefined"
    >
      <legend :class="['custom-input__label', { 'sr-only': hideLabel }]">
        <CustomText as="span" variant="small" weight="medium">{{ label }}</CustomText>
      </legend>
      <div class="custom-input__options">
        <div v-for="option in options" :key="String(option.value)" class="custom-input__option">
          <input
            :id="`${id}-${option.value}`"
            type="radio"
            class="custom-input__radio"
            :name="groupName"
            :value="option.value"
            :checked="model === option.value"
            :disabled="disabled || option.disabled"
            :required="required || undefined"
            @change="set(option.value)"
          />
          <CustomText as="label" variant="small" :for="`${id}-${option.value}`">{{
            option.label
          }}</CustomText>
        </div>
      </div>
    </fieldset>

    <!-- checkbox: control + label a la dreta -->
    <div v-else-if="type === 'checkbox'" class="custom-input__option">
      <input
        :id="id"
        type="checkbox"
        class="custom-input__checkbox"
        :checked="model === true"
        :disabled="disabled"
        :required="required || undefined"
        :aria-describedby="hintId"
        :aria-invalid="invalid"
        @change="onCheckbox"
      />
      <CustomText
        as="label"
        variant="small"
        weight="medium"
        :for="id"
        :class="{ 'sr-only': hideLabel }"
      >
        {{ label }}
      </CustomText>
    </div>

    <!-- resta: label a sobre + control -->
    <template v-else>
      <CustomText
        as="label"
        variant="small"
        weight="medium"
        :for="id"
        :class="['custom-input__label', { 'sr-only': hideLabel }]"
      >
        {{ label }}
      </CustomText>
      <div class="custom-input__field">
        <CustomIcon v-if="icon && isText" :name="icon" size="sm" class="custom-input__icon" />

        <textarea
          v-if="type === 'textarea'"
          :id="id"
          class="custom-input__control"
          :value="stringValue"
          :placeholder="placeholder || undefined"
          :rows="rows"
          :disabled="disabled"
          :required="required || undefined"
          :aria-describedby="hintId"
          :aria-invalid="invalid"
          @input="onText"
        />

        <select
          v-else-if="type === 'select'"
          :id="id"
          class="custom-input__control"
          :value="stringValue"
          :disabled="disabled"
          :required="required || undefined"
          :aria-describedby="hintId"
          :aria-invalid="invalid"
          @change="onSelect"
        >
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <option
            v-for="option in options"
            :key="String(option.value)"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>

        <select
          v-else-if="type === 'multiselect'"
          :id="id"
          class="custom-input__control"
          multiple
          :disabled="disabled"
          :required="required || undefined"
          :aria-describedby="hintId"
          :aria-invalid="invalid"
          @change="onMultiselect"
        >
          <option
            v-for="option in options"
            :key="String(option.value)"
            :value="option.value"
            :selected="isSelected(option.value)"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>

        <input
          v-else-if="type === 'number'"
          :id="id"
          type="number"
          class="custom-input__control"
          :value="stringValue"
          :placeholder="placeholder || undefined"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          :required="required || undefined"
          :aria-describedby="hintId"
          :aria-invalid="invalid"
          @input="onNumber"
        />

        <input
          v-else
          :id="id"
          :type="type"
          class="custom-input__control"
          :value="stringValue"
          :placeholder="placeholder || undefined"
          :disabled="disabled"
          :required="required || undefined"
          :aria-describedby="hintId"
          :aria-invalid="invalid"
          autocomplete="off"
          @input="onText"
        />
      </div>
    </template>

    <CustomText
      v-if="hint"
      :id="hintId"
      as="p"
      variant="caption"
      :tone="tone === 'danger' ? 'danger' : 'muted'"
      class="custom-input__hint"
    >
      {{ hint }}
    </CustomText>
  </div>
</template>
