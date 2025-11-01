<template>
  <label
    :class="[
      'inline-flex items-center gap-2 select-none',
      disabled ? 'cursor-default' : 'cursor-pointer',
    ]"
    @click="toggle"
  >
    <button
      :type="'button'"
      role="checkbox"
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-disabled="disabled ? 'true' : 'false'"
      :disabled="disabled"
      :class="[
        'inline-flex items-center justify-center',
        disabled ? 'cursor-default' : 'cursor-pointer',
      ]"
    >
      <UiIcon :path="iconPath" :class="iconColorClass" :size="20" />
      <span v-if="label" class="ml-2 text-sm">{{ label }}</span>
    </button>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from './UiIcon.vue'
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline } from '@mdi/js'

type Color = 'primary' | 'secondary' | 'accent' | 'green' | 'red' | 'blue' | 'grey' | 'yellow'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    color?: Color
    checkedColor?: Color
    disabled?: boolean
  }>(),
  { modelValue: false, label: '', color: 'primary', checkedColor: 'primary', disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const iconPath = computed(() =>
  props.modelValue ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline,
)

function mapColorToTextClass(color: Color): string {
  const c = color === 'grey' ? 'gray' : color
  // Tailwind classes must be static; enumerate explicitly
  switch (c) {
    case 'primary':
      return 'text-primary'
    case 'secondary':
      return 'text-secondary'
    case 'accent':
      return 'text-accent'
    case 'green':
      return 'text-green-600'
    case 'red':
      return 'text-red-700'
    case 'blue':
      return 'text-blue-600'
    case 'gray':
      return 'text-gray-700'
    case 'yellow':
      return 'text-yellow-600'
  }
  return 'text-primary'
}

const iconColorClass = computed(() => {
  if (props.disabled) return 'text-gray-400'
  return props.modelValue
    ? mapColorToTextClass(props.checkedColor)
    : mapColorToTextClass(props.color)
})

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>
