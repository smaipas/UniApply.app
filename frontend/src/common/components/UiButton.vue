<template>
  <button :type="props.type" :disabled="props.disabled" :class="buttonClasses">
    <UiIcon v-if="props.icon" :path="props.icon" :size="iconPx" :class="hasLabel ? 'mr-2' : ''" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import UiIcon from './UiIcon.vue'

type Size = 'sm' | 'md' | 'lg'
type Color = 'primary' | 'secondary' | 'accent' | 'red' | 'green' | 'gray'

const props = withDefaults(
  defineProps<{
    size?: Size
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    icon?: string
    flat?: boolean
    outline?: boolean
    color?: Color
    extraClass?: string
  }>(),
  {
    size: 'md',
    block: false,
    disabled: false,
    type: 'button',
    icon: undefined,
    flat: false,
    outline: false,
    color: 'primary',
    extraClass: '',
  },
)

const base =
  'inline-flex items-center justify-center rounded-xs font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:pointer-events-none'

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
}

// Icon sizes mapped to button size
const iconSizes: Record<Size, number> = { sm: 16, md: 20, lg: 24 }
const iconPx = computed(() => iconSizes[props.size])

function colorToClasses(color: Color) {
  // Static mappings to keep Tailwind classes discoverable
  switch (color) {
    case 'primary':
      return {
        text: 'text-primary',
        border: 'border-primary',
        hover: 'hover:bg-primary/10',
        bg: 'bg-primary',
      }
    case 'secondary':
      return {
        text: 'text-secondary',
        border: 'border-secondary',
        hover: 'hover:bg-secondary/10',
        bg: 'bg-secondary',
      }
    case 'accent':
      return {
        text: 'text-accent',
        border: 'border-accent',
        hover: 'hover:bg-accent/10',
        bg: 'bg-accent',
      }
    case 'red':
      return {
        text: 'text-red-700',
        border: 'border-red-700',
        hover: 'hover:bg-red-700/10',
        bg: 'bg-red-700',
      }
    case 'green':
      return {
        text: 'text-green-600',
        border: 'border-green-600',
        hover: 'hover:bg-green-600/10',
        bg: 'bg-green-600',
      }
    case 'gray':
      return {
        text: 'text-gray-700',
        border: 'border-gray-700',
        hover: 'hover:bg-gray-700/10',
        bg: 'bg-gray-700',
      }
  }
  return {
    text: 'text-primary',
    border: 'border-primary',
    hover: 'hover:bg-primary/10',
    bg: 'bg-primary',
  }
}

const styleClasses = computed(() => {
  const c = colorToClasses(props.color)
  if (props.flat) {
    return [c.text, c.hover, 'bg-transparent', 'border-transparent']
  }
  if (props.outline) {
    return ['border', c.border, c.text, 'bg-transparent', c.hover]
  }
  // solid
  return [c.bg, 'text-white', 'hover:opacity-95']
})

const buttonClasses = computed(() => [
  base,
  styleClasses.value,
  sizes[props.size],
  props.block ? 'w-full' : '',
  props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  props.extraClass,
])

const slots = useSlots()
const hasLabel = computed(() => !!slots.default?.().length)
</script>
