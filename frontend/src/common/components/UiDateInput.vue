<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </span>
    <div class="relative">
      <!-- Calendar icon (hidden on Safari iOS) -->
      <div
        class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none safari-date-icon"
      >
        <UiIcon :path="mdiCalendarMonth" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>

      <!-- Date input -->
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :min="min"
        :max="max"
        :class="[
          'bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400',
          isSafariIOS ? 'pl-10 pr-3' : 'ps-10',
        ]"
        @input="handleInput"
        @change="handleChange"
        @blur="emit('blur')"
      />
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mdiCalendarMonth } from '@mdi/js'
import UiIcon from './UiIcon.vue'
withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
    type?: 'date' | 'datetime-local'
    min?: string
    max?: string
  }>(),
  {
    type: 'date',
    placeholder: 'Select date',
    required: false,
    disabled: false,
    modelValue: '',
    error: '',
    label: '',
    min: '',
    max: '',
  },
)

// Detect Safari iOS
const isSafariIOS = computed(() => {
  if (typeof window === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent)
  )
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', v: string): void
  (e: 'blur'): void
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('change', target.value)
}
</script>

<style scoped>
/* Custom styling for date inputs */
input[type='date']::-webkit-calendar-picker-indicator,
input[type='datetime-local']::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

/* Safari iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  /* Hide the native Safari calendar icon completely */
  input[type='date']::-webkit-calendar-picker-indicator,
  input[type='datetime-local']::-webkit-calendar-picker-indicator {
    display: none !important;
  }

  /* Keep our custom icon visible on Safari iOS */
  .safari-date-icon {
    display: flex !important;
  }

  /* Adjust padding for Safari iOS to use our custom icon */
  input[type='date'],
  input[type='datetime-local'] {
    padding-left: 40px !important;
    padding-right: 12px !important;
  }
}

input[type='date']::-webkit-datetime-edit,
input[type='datetime-local']::-webkit-datetime-edit {
  color: #374151;
}

input[type='date']::-webkit-datetime-edit-fields-wrapper,
input[type='datetime-local']::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

input[type='date']::-webkit-datetime-edit-text,
input[type='datetime-local']::-webkit-datetime-edit-text {
  color: #6b7280;
  padding: 0 2px;
}

input[type='date']::-webkit-datetime-edit-month-field,
input[type='date']::-webkit-datetime-edit-day-field,
input[type='date']::-webkit-datetime-edit-year-field,
input[type='datetime-local']::-webkit-datetime-edit-month-field,
input[type='datetime-local']::-webkit-datetime-edit-day-field,
input[type='datetime-local']::-webkit-datetime-edit-year-field {
  color: #374151;
}

/* Dark mode support */
.dark input[type='date']::-webkit-datetime-edit,
.dark input[type='datetime-local']::-webkit-datetime-edit {
  color: #f9fafb;
}

.dark input[type='date']::-webkit-datetime-edit-text,
.dark input[type='datetime-local']::-webkit-datetime-edit-text {
  color: #9ca3af;
}

.dark input[type='date']::-webkit-datetime-edit-month-field,
.dark input[type='date']::-webkit-datetime-edit-day-field,
.dark input[type='date']::-webkit-datetime-edit-year-field,
.dark input[type='datetime-local']::-webkit-datetime-edit-month-field,
.dark input[type='datetime-local']::-webkit-datetime-edit-day-field,
.dark input[type='datetime-local']::-webkit-datetime-edit-year-field {
  color: #f9fafb;
}

/* Attempt to style the date picker dropdown (limited browser support) */
input[type='date']::-webkit-calendar-picker-indicator:hover {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

/* Firefox specific styling */
input[type='date']::-moz-calendar-picker-indicator {
  background: transparent;
  border: none;
  cursor: pointer;
}

/* Edge specific styling */
input[type='date']::-ms-clear,
input[type='date']::-ms-expand {
  display: none;
}

/* Global date picker styling (very limited) */
::webkit-calendar-picker {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Note: Most of these styles won't work due to browser restrictions */
</style>
