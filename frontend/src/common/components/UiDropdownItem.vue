<template>
  <button
    type="button"
    @click="handleClick"
    :disabled="disabled"
    class="group flex w-full items-center px-4 py-2 text-sm transition-colors"
    :class="[
      disabled
        ? 'text-gray-400 cursor-not-allowed'
        : variant === 'danger'
          ? 'text-red-700 hover:bg-red-50 hover:text-red-900'
          : variant === 'warning'
            ? 'text-yellow-700 hover:bg-yellow-50 hover:text-yellow-900'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
    ]"
  >
    <UiIcon
      v-if="icon"
      :path="icon"
      class="mr-3 h-4 w-4"
      :class="[
        disabled
          ? 'text-gray-400'
          : variant === 'danger'
            ? 'text-red-500'
            : variant === 'warning'
              ? 'text-yellow-500'
              : 'text-gray-500',
      ]"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { UiIcon } from '@/common/components'

interface Props {
  label: string
  icon?: string
  variant?: 'default' | 'danger' | 'warning'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  if (!props.disabled) {
    emit('click')
  }
}
</script>
