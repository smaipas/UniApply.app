<template>
  <div class="relative">
    <div class="relative">
      <input
        :id="id"
        ref="inputRef"
        v-model="searchQuery"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
        @focus="showDropdown = true"
        @blur="handleBlur"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="showDropdown && filteredCountries.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="(country, index) in filteredCountries"
        :key="country.code"
        :class="[
          'px-3 py-2 cursor-pointer hover:bg-gray-100',
          { 'bg-primary text-white hover:bg-primary-dark': index === selectedIndex },
        ]"
        @mousedown="selectCountry(country)"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">{{ country.name }}</span>
          <span class="text-sm text-gray-500">{{ country.code }}</span>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div
      v-if="showDropdown && searchQuery && filteredCountries.length === 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
    >
      <div class="px-3 py-2 text-gray-500">No countries found</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { countries, type Country } from '@/common/utils/countries'

interface Props {
  modelValue?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a country...',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(0)

const filteredCountries = computed(() => {
  if (!searchQuery.value) {
    return countries.slice(0, 10) // Show first 10 countries when no search
  }

  const query = searchQuery.value.toLowerCase()
  return countries
    .filter(
      (country) =>
        country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query),
    )
    .slice(0, 20) // Limit to 20 results
})

const selectedCountry = computed(() => {
  if (!props.modelValue) return null
  return countries.find((c) => c.code === props.modelValue)
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && selectedCountry.value) {
      searchQuery.value = selectedCountry.value.name
    } else if (!newValue) {
      searchQuery.value = ''
    }
  },
  { immediate: true },
)

function handleInput() {
  showDropdown.value = true
  selectedIndex.value = 0
  emit('update:modelValue', '')
}

function handleBlur() {
  // Delay hiding dropdown to allow for click events
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

function handleKeydown(event: KeyboardEvent) {
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredCountries.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredCountries.value[selectedIndex.value]) {
        selectCountry(filteredCountries.value[selectedIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      break
  }
}

function selectCountry(country: Country) {
  searchQuery.value = country.name
  emit('update:modelValue', country.code)
  showDropdown.value = false
}

// Focus management
function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>
