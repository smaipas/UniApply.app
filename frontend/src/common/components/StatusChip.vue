<template>
  <span
    :class="[
      'text-xs font-medium px-2.5 py-0.5 rounded-sm',
      colorClasses,
      bordered ? 'border' : '',
    ]"
  >
    {{ formattedStatus }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
})

const formattedStatus = computed(() => {
  return props.status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
})

const colorClasses = computed(() => {
  const statusColors = {
    DRAFT: props.bordered
      ? 'bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-blue-400 border-blue-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300 border-1',
    PENDING_APPROVAL: props.bordered
      ? 'bg-amber-100 text-amber-700 dark:bg-gray-700 dark:text-amber-400 border-amber-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-300 border-1',
    APPROVED: props.bordered
      ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400 border-green-300'
      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300 border-1',
    REJECTED: props.bordered
      ? 'bg-red-100 text-red-700 dark:bg-gray-700 dark:text-red-400 border-red-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-300 border-1',
  }

  return statusColors[props.status as keyof typeof statusColors] || statusColors['DRAFT']
})
</script>
