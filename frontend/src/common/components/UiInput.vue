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
          'w-full rounded-xs border bg-white py-2 text-sm outline-none ring-0 transition focus:ring-2 disabled:bg-gray-100',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-300 focus:border-primary focus:ring-primary/30',
          icon ? 'pl-10' : 'px-3',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <UiIcon
        v-if="icon"
        :path="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
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
}>()
</script>
