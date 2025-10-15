<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </span>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full rounded-xs border bg-white py-2.5 text-sm outline-none ring-0 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30 hover:border-red-400'
            : 'border-gray-300 focus:border-primary focus:ring-primary/30 hover:border-gray-400',
          icon ? 'pl-10' : 'px-3',
          type === 'date' ? 'cursor-pointer' : '',
        ]"
        @input="onInput"
        @blur="onBlur"
      />
      <UiIcon
        v-if="icon"
        :path="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <!-- Calendar icon for date inputs -->
      <div
        v-if="type === 'date'"
        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue'

withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: string
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
    icon?: string
  }>(),
  {
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    modelValue: '',
    error: '',
    icon: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'blur'): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  onBlur()
}

function onBlur() {
  emit('blur')
}
</script>

<style scoped>
/* Custom styling for date inputs */
input[type='date']::-webkit-calendar-picker-indicator {
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

input[type='date']::-webkit-datetime-edit {
  color: #374151;
}

input[type='date']::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

input[type='date']::-webkit-datetime-edit-text {
  color: #6b7280;
  padding: 0 2px;
}

input[type='date']::-webkit-datetime-edit-month-field,
input[type='date']::-webkit-datetime-edit-day-field,
input[type='date']::-webkit-datetime-edit-year-field {
  color: #374151;
}

/* Safari iOS specific fixes for date inputs */
@supports (-webkit-touch-callout: none) {
  /* Hide the native Safari calendar icon completely */
  input[type='date']::-webkit-calendar-picker-indicator {
    display: none !important;
  }

  /* Adjust padding for Safari iOS date inputs */
  input[type='date'] {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}
</style>
