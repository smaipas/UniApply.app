<template>
  <span
    :class="[
      'text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm',
      colorClasses,
      bordered ? 'border' : '',
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple' | 'pink'
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  bordered: false,
})

const colorClasses = computed(() => {
  const colors = {
    blue: props.bordered
      ? 'bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-blue-400 border-blue-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300 border-1',
    green: props.bordered
      ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400 border-green-300'
      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300 border-1',
    red: props.bordered
      ? 'bg-red-100 text-red-700 dark:bg-gray-700 dark:text-red-400 border-red-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-300 border-1',
    yellow: props.bordered
      ? 'bg-yellow-100 text-yellow-700 dark:bg-gray-700 dark:text-yellow-400 border-yellow-300'
      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 border-1',
    gray: props.bordered
      ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-gray-300'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border-gray-300 border-1',
    purple: props.bordered
      ? 'bg-purple-100 text-purple-700 dark:bg-gray-700 dark:text-purple-400 border-purple-300'
      : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-300 border-1',
    pink: props.bordered
      ? 'bg-pink-100 text-pink-700 dark:bg-gray-700 dark:text-pink-400 border-pink-300'
      : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 border-pink-300 border-1',
  }
  return colors[props.color]
})
</script>
