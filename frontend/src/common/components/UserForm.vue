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
            :error="errorMessageHandler(v$.firstName)"
            :disabled="disabled"
            @blur="v$.firstName.$touch"
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
            :error="errorMessageHandler(v$.lastName)"
            :disabled="disabled"
            @blur="v$.lastName.$touch"
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
          :error="errorMessageHandler(v$.email)"
          :disabled="disabled"
          @blur="v$.email.$touch"
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
          :error="errorMessageHandler(v$.tel)"
          :disabled="disabled"
          @blur="v$.tel.$touch"
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
          :error="errorMessageHandler(v$.dateOfBirth)"
          :disabled="disabled"
          @blur="v$.dateOfBirth.$touch"
        />
      </div>

      <div>
        <label for="gender" class="block text-sm font-medium text-gray-700 mb-1"> Gender </label>
        <UiSelect
          id="gender"
          v-model="formData.gender"
          :options="genderOptions"
          placeholder="Select gender"
          :error="errorMessageHandler(v$.gender)"
          :disabled="disabled"
          @blur="v$.gender.$touch"
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
          :error="errorMessageHandler(v$.nationality)"
          :disabled="disabled"
          @blur="v$.nationality.$touch"
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
          :error="errorMessageHandler(v$.studentId)"
          :disabled="disabled"
          @blur="v$.studentId.$touch"
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
            :error="errorMessageHandler(v$.userOfficialId)"
            :disabled="disabled"
            @blur="v$.userOfficialId.$touch"
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
            :error="errorMessageHandler(v$.userOfficialType)"
            :disabled="disabled"
            @blur="v$.userOfficialType.$touch"
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
          <label for="street" class="block text-sm font-medium text-gray-700 mb-1">
            Street <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="street"
            v-model="formData.address.street"
            placeholder="Enter street name"
            :error="errorMessageHandler(v$.address.street)"
            :disabled="disabled"
            @blur="v$.address.street.$touch"
          />
        </div>

        <div>
          <label for="number" class="block text-sm font-medium text-gray-700 mb-1">
            Number <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="number"
            v-model="formData.address.number"
            placeholder="Enter house number"
            :error="errorMessageHandler(v$.address.number)"
            :disabled="disabled"
            @blur="v$.address.number.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
            City <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="city"
            v-model="formData.address.city"
            placeholder="Enter city"
            :error="errorMessageHandler(v$.address.city)"
            :disabled="disabled"
            @blur="v$.address.city.$touch"
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
            :error="errorMessageHandler(v$.address.province)"
            :disabled="disabled"
            @blur="v$.address.province.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="zipCode"
            v-model="formData.address.zipCode"
            placeholder="Enter ZIP or postal code"
            :error="errorMessageHandler(v$.address.zipCode)"
            :disabled="disabled"
            @blur="v$.address.zipCode.$touch"
          />
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-gray-700 mb-1">
            Country <span class="text-red-500">*</span>
          </label>
          <UiCountrySelect
            id="country"
            v-model="formData.address.country"
            placeholder="Search for a country..."
            :error="errorMessageHandler(v$.address.country)"
            :disabled="disabled"
            @blur="v$.address.country.$touch"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <slot name="actions" :form-data="formData" :errors="errors" :loading="loading">
        <UiButton flat @click="$emit('cancel')">Cancel</UiButton>
        <UiButton type="submit" :loading="loading" :disabled="loading || disabled || v$.$invalid">
          {{ loading ? 'Saving...' : 'Save' }}
        </UiButton>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import {
  required,
  email as emailValidator,
  minLength,
  maxLength,
  helpers,
} from '@vuelidate/validators'
import { UiButton, UiInput, UiSelect, UiCountrySelect } from '@/common/components'
import { errorMessageHandler } from '@/common/utils/validation'

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

// Vuelidate rules based on schema requirements
const rules = computed(() => ({
  firstName: {
    required: helpers.withMessage('First name is required', required),
    minLength: helpers.withMessage('First name must be at least 2 characters', minLength(2)),
    maxLength: helpers.withMessage('First name must be at most 64 characters', maxLength(64)),
  },
  lastName: {
    required: helpers.withMessage('Last name is required', required),
    minLength: helpers.withMessage('Last name must be at least 2 characters', minLength(2)),
    maxLength: helpers.withMessage('Last name must be at most 64 characters', maxLength(64)),
  },
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Please enter a valid email address', emailValidator),
  },
  tel: {
    required: helpers.withMessage('Phone number is required', required),
    e164Phone: helpers.withMessage(
      'Please enter a valid phone number in international format (e.g., +35712345678)',
      helpers.regex(/^\+?[1-9]\d{1,14}$/),
    ),
  },
  dateOfBirth: {
    // Optional field, no validation needed
  },
  gender: {
    // Optional field, no validation needed
  },
  studentId: {
    required: helpers.withMessage('Student ID is required', required),
    minLength: helpers.withMessage('Student ID must be at least 1 character', minLength(1)),
    maxLength: helpers.withMessage('Student ID must be at most 10 characters', maxLength(10)),
  },
  userOfficialId: {
    required: helpers.withMessage('Official ID number is required', required),
    minLength: helpers.withMessage(
      'Official ID number must be at least 2 characters',
      minLength(2),
    ),
    maxLength: helpers.withMessage(
      'Official ID number must be at most 32 characters',
      maxLength(32),
    ),
  },
  userOfficialType: {
    required: helpers.withMessage('Official ID type is required', required),
  },
  address: {
    street: {
      required: helpers.withMessage('Street is required', required),
    },
    number: {
      required: helpers.withMessage('House number is required', required),
    },
    city: {
      required: helpers.withMessage('City is required', required),
    },
    province: {
      // Optional field, no validation needed
    },
    zipCode: {
      required: helpers.withMessage('ZIP/Postal code is required', required),
    },
    country: {
      required: helpers.withMessage('Country is required', required),
    },
  },
  nationality: {
    minLength: helpers.withMessage('Nationality must be at least 1 character', minLength(1)),
    maxLength: helpers.withMessage('Nationality must be at most 100 characters', maxLength(100)),
  },
}))

const v$ = useVuelidate(rules, formData)

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

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    return
  }
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
    v$.value.$reset()
  },
})
</script>
