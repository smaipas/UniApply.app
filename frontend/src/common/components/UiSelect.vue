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
          'w-full rounded-xs border bg-white py-2.5 px-3 text-sm outline-none ring-0 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none cursor-pointer',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30 hover:border-red-400'
            : 'border-gray-300 focus:border-primary focus:ring-primary/30 hover:border-gray-400',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        @blur="emit('blur')"
      >
        <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <!-- Custom dropdown arrow -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
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
  (e: 'blur'): void
}>()
</script>

<style scoped>
select option {
  padding: 8px 12px;
  background-color: white;
  color: #374151;
  font-size: 14px;
}

select option:hover {
  background-color: var(--color-primary);
  color: white;
}

select option:checked {
  background-color: var(--color-primary);
  color: white;
}

select option:disabled {
  color: #9ca3af;
  font-style: italic;
}
</style>
