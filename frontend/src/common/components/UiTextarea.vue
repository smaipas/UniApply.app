<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </span>
    <div class="relative">
      <textarea
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :class="[
          'w-full rounded-xs border bg-white py-2.5 text-sm outline-none ring-0 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30 hover:border-red-400'
            : 'border-gray-300 focus:border-primary focus:ring-primary/30 hover:border-gray-400',
          'px-3',
        ]"
        @input="onInput"
        @blur="onBlur"
      />
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  error: '',
  required: false,
  disabled: false,
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

function onBlur() {
  emit('blur')
}
</script>
