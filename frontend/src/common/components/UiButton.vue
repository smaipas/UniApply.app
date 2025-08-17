<template>
  <button :type="props.type" :disabled="props.disabled" :class="buttonClasses">
    <UiIcon v-if="props.icon" :path="props.icon" class="mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from './UiIcon.vue'

type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    icon?: string
    flat?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    disabled: false,
    type: 'button',
    icon: undefined,
    flat: false,
  },
)

// The base and variant definitions remain the same
const base =
  'inline-flex items-center justify-center rounded-xs font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:opacity-95',
  secondary: 'bg-secondary text-white hover:opacity-95',
  accent: 'bg-accent text-white hover:opacity-95',
  outline: 'border border-primary text-primary bg-transparent hover:bg-primary/5',
  ghost: 'text-primary hover:bg-primary/10',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
}

// Create a computed property for the class list
const buttonClasses = computed(() => [
  base,
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : '',
  props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  props.flat ? '!bg-transparent !border-transparent' : '',
])
</script>
