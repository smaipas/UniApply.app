<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Personal Information -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Personal Information
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
            First Name <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="firstName"
            v-model="formData.firstName"
            placeholder="Enter first name"
            :error="errors.firstName"
            :disabled="disabled"
            required
          />
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="lastName"
            v-model="formData.lastName"
            placeholder="Enter last name"
            :error="errors.lastName"
            :disabled="disabled"
            required
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email <span class="text-red-500">*</span>
        </label>
        <UiInput
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Enter email"
          :error="errors.email"
          :disabled="disabled"
          required
        />
      </div>

      <div>
        <label for="tel" class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <UiInput
          id="tel"
          v-model="formData.tel"
          placeholder="+1234567890"
          :error="errors.tel"
          :disabled="disabled"
          required
        />
        <p class="text-sm text-gray-500 mt-1">Use international format (e.g., +35712345678)</p>
      </div>

      <div>
        <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <UiInput
          id="dateOfBirth"
          v-model="formData.dateOfBirth"
          type="date"
          :error="errors.dateOfBirth"
          :disabled="disabled"
        />
      </div>

      <div>
        <label for="gender" class="block text-sm font-medium text-gray-700 mb-1"> Gender </label>
        <UiSelect
          id="gender"
          v-model="formData.gender"
          :options="genderOptions"
          placeholder="Select gender"
          :error="errors.gender"
          :disabled="disabled"
        />
      </div>

      <div>
        <label for="nationality" class="block text-sm font-medium text-gray-700 mb-1">
          Nationality
        </label>
        <UiCountrySelect
          id="nationality"
          v-model="formData.nationality"
          placeholder="Search for your nationality..."
          :error="errors.nationality"
          :disabled="disabled"
        />
      </div>
    </div>

    <!-- Student Information -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Student Information
      </h2>

      <div>
        <label for="studentId" class="block text-sm font-medium text-gray-700 mb-1">
          Student ID <span class="text-red-500">*</span>
        </label>
        <UiInput
          id="studentId"
          v-model="formData.studentId"
          placeholder="Enter student ID"
          :error="errors.studentId"
          :disabled="disabled"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="userOfficialId" class="block text-sm font-medium text-gray-700 mb-1">
            Official ID Number <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="userOfficialId"
            v-model="formData.userOfficialId"
            placeholder="Enter official ID number"
            :error="errors.userOfficialId"
            :disabled="disabled"
            required
          />
        </div>

        <div>
          <label for="userOfficialType" class="block text-sm font-medium text-gray-700 mb-1">
            Official ID Type <span class="text-red-500">*</span>
          </label>
          <UiSelect
            id="userOfficialType"
            v-model="formData.userOfficialType"
            :options="officialIdTypeOptions"
            placeholder="Select ID type"
            :error="errors.userOfficialType"
            :disabled="disabled"
            required
          />
        </div>
      </div>
    </div>

    <!-- Address Information -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Address Information
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="street" class="block text-sm font-medium text-gray-700 mb-1"> Street </label>
          <UiInput
            id="street"
            v-model="formData.address.street"
            placeholder="Enter street name"
            :error="errors.address?.street"
            :disabled="disabled"
          />
        </div>

        <div>
          <label for="number" class="block text-sm font-medium text-gray-700 mb-1"> Number </label>
          <UiInput
            id="number"
            v-model="formData.address.number"
            placeholder="Enter house number"
            :error="errors.address?.number"
            :disabled="disabled"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-1"> City </label>
          <UiInput
            id="city"
            v-model="formData.address.city"
            placeholder="Enter city"
            :error="errors.address?.city"
            :disabled="disabled"
          />
        </div>

        <div>
          <label for="province" class="block text-sm font-medium text-gray-700 mb-1">
            Province/State
          </label>
          <UiInput
            id="province"
            v-model="formData.address.province"
            placeholder="Enter province or state"
            :error="errors.address?.province"
            :disabled="disabled"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code
          </label>
          <UiInput
            id="zipCode"
            v-model="formData.address.zipCode"
            placeholder="Enter ZIP or postal code"
            :error="errors.address?.zipCode"
            :disabled="disabled"
          />
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <UiCountrySelect
            id="country"
            v-model="formData.address.country"
            placeholder="Search for a country..."
            :error="errors.address?.country"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <slot name="actions" :form-data="formData" :errors="errors" :loading="loading">
        <UiButton flat @click="$emit('cancel')">Cancel</UiButton>
        <UiButton type="submit" :loading="loading" :disabled="loading || disabled">
          {{ loading ? 'Saving...' : 'Save' }}
        </UiButton>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { UiButton, UiInput, UiSelect, UiCountrySelect } from '@/common/components'

interface Address {
  street?: string
  number?: string
  city?: string
  province?: string
  zipCode?: string
  country?: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  tel: string
  dateOfBirth?: string
  gender?: string
  studentId: string
  userOfficialId: string
  userOfficialType: string
  address: Address
  nationality?: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  tel?: string
  dateOfBirth?: string
  gender?: string
  studentId?: string
  userOfficialId?: string
  userOfficialType?: string
  address?: {
    street?: string
    number?: string
    city?: string
    province?: string
    zipCode?: string
    country?: string
  }
  nationality?: string
}

interface Props {
  modelValue?: Partial<FormData>
  errors?: FormErrors
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Partial<FormData>]
  submit: [data: FormData]
  cancel: []
}>()

const formData = ref<FormData>({
  firstName: '',
  lastName: '',
  email: '',
  tel: '',
  dateOfBirth: '',
  gender: '',
  studentId: '',
  userOfficialId: '',
  userOfficialType: '',
  address: {},
  nationality: '',
})

const officialIdTypeOptions = [
  { label: 'National ID', value: 'ID' },
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Driving Licence', value: 'DRIVING_LICENCE' },
  { label: 'Other', value: 'OTHER' },
]

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
]

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Only update if the values are actually different to avoid circular updates
      const newFormData = {
        firstName: newValue.firstName || '',
        lastName: newValue.lastName || '',
        email: newValue.email || '',
        tel: newValue.tel || '',
        dateOfBirth: newValue.dateOfBirth || '',
        gender: newValue.gender || '',
        studentId: newValue.studentId || '',
        userOfficialId: newValue.userOfficialId || '',
        userOfficialType: newValue.userOfficialType || '',
        address: {
          street: newValue.address?.street || '',
          number: newValue.address?.number || '',
          city: newValue.address?.city || '',
          province: newValue.address?.province || '',
          zipCode: newValue.address?.zipCode || '',
          country: newValue.address?.country || '',
        },
        nationality: newValue.nationality || '',
      }

      // Only update if values are different
      if (JSON.stringify(formData.value) !== JSON.stringify(newFormData)) {
        formData.value = newFormData
      }
    }
  },
  { immediate: true, deep: true },
)

// Emit changes back to parent with debouncing to prevent rapid updates
let emitTimeout: NodeJS.Timeout | null = null
watch(
  formData,
  (newValue) => {
    if (emitTimeout) {
      clearTimeout(emitTimeout)
    }
    emitTimeout = setTimeout(() => {
      emit('update:modelValue', newValue)
    }, 100)
  },
  { deep: true },
)

// Cleanup timeout on component unmount
onUnmounted(() => {
  if (emitTimeout) {
    clearTimeout(emitTimeout)
  }
})

function handleSubmit() {
  emit('submit', formData.value)
}

// Expose form data for parent components
defineExpose({
  formData: computed(() => formData.value),
  reset: () => {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      tel: '',
      dateOfBirth: '',
      gender: '',
      studentId: '',
      userOfficialId: '',
      userOfficialType: '',
      address: {},
      nationality: '',
    }
  },
})
</script>
