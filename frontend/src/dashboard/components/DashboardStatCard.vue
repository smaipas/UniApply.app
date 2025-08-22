<template>
  <div
    class="bg-white rounded-xs shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">{{ label }}</p>
        <p class="text-3xl font-bold text-gray-900">{{ value.toLocaleString() }}</p>
        <div v-if="trend" class="flex items-center mt-2">
          <span :class="['text-sm font-medium', trend > 0 ? 'text-green-600' : 'text-red-600']">
            {{ trend > 0 ? '+' : '' }}{{ trend }}%
          </span>
          <span class="text-gray-500 text-sm ml-1">vs last month</span>
        </div>
      </div>
      <div class="w-12 h-12 rounded-xs flex items-center justify-center" :class="iconBgClass">
        <svg class="w-6 h-6" :class="iconTextClass" viewBox="0 0 24 24">
          <path fill="currentColor" :d="icon" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  mdiFileDocumentOutline,
  mdiClockOutline,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiAccountGroupOutline,
  mdiTrendingUp,
} from '@mdi/js'

interface Props {
  label: string
  value: number
  icon?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  trend?: number
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdiFileDocumentOutline',
  variant: 'primary',
  trend: undefined,
})

const iconBgClass = computed(() => {
  const classes = {
    primary: 'bg-gradient-to-br from-blue-100 to-blue-200',
    success: 'bg-gradient-to-br from-green-100 to-green-200',
    warning: 'bg-gradient-to-br from-amber-100 to-amber-200',
    danger: 'bg-gradient-to-br from-red-100 to-red-200',
    info: 'bg-gradient-to-br from-cyan-100 to-cyan-200',
    secondary: 'bg-gradient-to-br from-gray-100 to-gray-200',
  }
  return classes[props.variant]
})

const iconTextClass = computed(() => {
  const classes = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-cyan-600',
    secondary: 'text-gray-600',
  }
  return classes[props.variant]
})

const icon = computed(() => {
  const iconMap: Record<string, string> = {
    mdiFileDocumentOutline: mdiFileDocumentOutline,
    mdiClockOutline: mdiClockOutline,
    mdiCheckCircleOutline: mdiCheckCircleOutline,
    mdiCloseCircleOutline: mdiCloseCircleOutline,
    mdiAccountGroupOutline: mdiAccountGroupOutline,
    mdiTrendingUp: mdiTrendingUp,
  }
  return iconMap[props.icon as string] || mdiFileDocumentOutline
})
</script>
