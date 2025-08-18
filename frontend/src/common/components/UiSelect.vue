<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </span>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        :class="[
          'w-full rounded-xs border bg-white py-2 px-3 text-sm outline-none ring-0 transition focus:ring-2 disabled:bg-gray-100',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-300 focus:border-primary focus:ring-primary/30',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
type Option = { label: string; value: string }

withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
    options: Option[]
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    error: '',
    required: false,
    disabled: false,
    options: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()
</script>
