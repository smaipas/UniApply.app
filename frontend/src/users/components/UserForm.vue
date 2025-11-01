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
            :error="getFieldError('firstName')"
            :disabled="disabled"
            @blur="v$.firstName?.$touch"
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
            :error="getFieldError('lastName')"
            :disabled="disabled"
            @blur="v$.lastName?.$touch"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="fathersName" class="block text-sm font-medium text-gray-700 mb-1">
            Father's Name <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="fathersName"
            v-model="formData.fathersName"
            placeholder="Enter father's name"
            :error="getFieldError('fathersName')"
            :disabled="disabled"
            @blur="v$.fathersName?.$touch"
            required
          />
        </div>

        <div>
          <label for="mothersName" class="block text-sm font-medium text-gray-700 mb-1">
            Mother's Name <span class="text-red-500">*</span>
          </label>
          <UiInput
            id="mothersName"
            v-model="formData.mothersName"
            placeholder="Enter mother's name"
            :error="getFieldError('mothersName')"
            :disabled="disabled"
            @blur="v$.mothersName?.$touch"
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
          :error="getFieldError('email')"
          :disabled="disabled"
          @blur="v$.email?.$touch"
          required
        />
      </div>

      <div>
        <label for="mobilePhoneNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Mobile Phone Number
        </label>
        <UiInput
          id="mobilePhoneNumber"
          v-model="formData.mobilePhoneNumber"
          placeholder="+1234567890"
          :error="getFieldError('mobilePhoneNumber')"
          :disabled="disabled"
          @blur="v$.mobilePhoneNumber?.$touch"
        />
      </div>

      <div>
        <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <UiInput
          id="phoneNumber"
          v-model="formData.phoneNumber"
          placeholder="+1234567890"
          :error="getFieldError('phoneNumber')"
          :disabled="disabled"
          @blur="v$.phoneNumber?.$touch"
        />
      </div>

      <div>
        <label for="gender" class="block text-sm font-medium text-gray-700 mb-1"> Gender </label>
        <UiSelect
          id="gender"
          v-model="formData.gender"
          :options="genderOptions"
          placeholder="Select gender"
          :error="getFieldError('gender')"
          :disabled="disabled"
          @blur="v$.gender?.$touch"
        />
      </div>

      <div>
        <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <UiDateInput
          id="dateOfBirth"
          v-model="formData.dateOfBirth"
          placeholder="YYYY-MM-DD"
          :error="getFieldError('dateOfBirth')"
          :disabled="disabled"
          @blur="v$.dateOfBirth?.$touch"
        />
      </div>

      <div>
        <label for="placeOfBirth" class="block text-sm font-medium text-gray-700 mb-1">
          Place of Birth
        </label>
        <UiInput
          id="placeOfBirth"
          v-model="formData.placeOfBirth"
          placeholder="Enter place of birth"
          :error="getFieldError('placeOfBirth')"
          :disabled="disabled"
          @blur="v$.placeOfBirth?.$touch"
        />
      </div>

      <div>
        <label for="nationality" class="block text-sm font-medium text-gray-700 mb-1">
          Nationality
        </label>
        <UiInput
          id="nationality"
          v-model="formData.nationality"
          placeholder="Enter nationality"
          :error="getFieldError('nationality')"
          :disabled="disabled"
          @blur="v$.nationality?.$touch"
        />
      </div>

      <!-- Male-specific fields -->
      <div v-if="formData.gender === 'MALE'" class="space-y-4">
        <h3 class="text-md font-medium text-gray-900">Male Registry Information</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="maleRegistryNumber" class="block text-sm font-medium text-gray-700 mb-1">
              Male Registry Number
            </label>
            <UiInput
              id="maleRegistryNumber"
              v-model="formData.maleRegistryNumber"
              placeholder="Enter male registry number"
              :error="getFieldError('maleRegistryNumber')"
              :disabled="disabled"
              @blur="v$.maleRegistryNumber?.$touch"
            />
          </div>

          <div>
            <label
              for="maleRegistryIssuedPlace"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Male Registry Issued Place
            </label>
            <UiInput
              id="maleRegistryIssuedPlace"
              v-model="formData.maleRegistryIssuedPlace"
              placeholder="Enter issued place"
              :error="getFieldError('maleRegistryIssuedPlace')"
              :disabled="disabled"
              @blur="v$.maleRegistryIssuedPlace?.$touch"
            />
          </div>
        </div>

        <div>
          <label for="militaryObligations" class="block text-sm font-medium text-gray-700 mb-1">
            Military Obligations
          </label>
          <UiSelect
            id="militaryObligations"
            v-model="formData.militaryObligations"
            :options="militaryObligationsOptions"
            placeholder="Select military obligations"
            :error="getFieldError('militaryObligations')"
            :disabled="disabled"
            @blur="v$.militaryObligations?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="maritalStatus" class="block text-sm font-medium text-gray-700 mb-1">
            Marital Status
          </label>
          <UiSelect
            id="maritalStatus"
            v-model="formData.maritalStatus"
            :options="maritalStatusOptions"
            placeholder="Select marital status"
            :error="getFieldError('maritalStatus')"
            :disabled="disabled"
            @blur="v$.maritalStatus?.$touch"
          />
        </div>

        <div>
          <label for="numberOfChildren" class="block text-sm font-medium text-gray-700 mb-1">
            Number of Children
          </label>
          <UiInput
            id="numberOfChildren"
            v-model.number="formData.numberOfChildren"
            type="number"
            min="0"
            placeholder="Enter number of children"
            :error="getFieldError('numberOfChildren')"
            :disabled="disabled"
            @blur="v$.numberOfChildren?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="municipalRegisterNumber" class="block text-sm font-medium text-gray-700 mb-1">
            Municipal Register Number
          </label>
          <UiInput
            id="municipalRegisterNumber"
            v-model.number="formData.municipalRegisterNumber"
            type="number"
            min="0"
            placeholder="Enter municipal register number"
            :error="getFieldError('municipalRegisterNumber')"
            :disabled="disabled"
            @blur="v$.municipalRegisterNumber?.$touch"
          />
        </div>

        <div>
          <label
            for="municipalRegisterPrefecture"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Municipal Register Prefecture
          </label>
          <UiInput
            id="municipalRegisterPrefecture"
            v-model="formData.municipalRegisterPrefecture"
            placeholder="Enter prefecture"
            :error="getFieldError('municipalRegisterPrefecture')"
            :disabled="disabled"
            @blur="v$.municipalRegisterPrefecture?.$touch"
          />
        </div>
      </div>

      <div>
        <label for="ssn" class="block text-sm font-medium text-gray-700 mb-1">
          Social Security Number
        </label>
        <UiInput
          id="ssn"
          v-model.number="formData.ssn"
          type="number"
          min="0"
          placeholder="Enter SSN"
          :error="getFieldError('ssn')"
          :disabled="disabled"
          @blur="v$.ssn?.$touch"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="academicEnrollmentYear" class="block text-sm font-medium text-gray-700 mb-1">
            Academic Enrollment Year
          </label>
          <UiInput
            id="academicEnrollmentYear"
            v-model.number="formData.academicEnrollmentYear"
            type="number"
            min="1900"
            :max="new Date().getFullYear() + 10"
            placeholder="Enter enrollment year"
            :error="getFieldError('academicEnrollmentYear')"
            :disabled="disabled"
            @blur="v$.academicEnrollmentYear?.$touch"
          />
        </div>

        <div>
          <label for="department" class="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <UiInput
            id="department"
            v-model="formData.department"
            placeholder="Enter department"
            :error="getFieldError('department')"
            :disabled="disabled"
            @blur="v$.department?.$touch"
          />
        </div>
      </div>
    </div>

    <!-- Student Information -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Student Information
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="studentId" class="block text-sm font-medium text-gray-700 mb-1">
            Student ID
          </label>
          <UiInput
            id="studentId"
            v-model="formData.studentId"
            placeholder="Enter student ID"
            :error="getFieldError('studentId')"
            :disabled="disabled"
            @blur="v$.studentId?.$touch"
          />
        </div>

        <div>
          <label for="userOfficialId" class="block text-sm font-medium text-gray-700 mb-1">
            Official ID Number
          </label>
          <UiInput
            id="userOfficialId"
            v-model="formData.userOfficialId"
            placeholder="Enter official ID number"
            :error="getFieldError('userOfficialId')"
            :disabled="disabled"
            @blur="v$.userOfficialId?.$touch"
          />
        </div>

        <div>
          <label for="userOfficialType" class="block text-sm font-medium text-gray-700 mb-1">
            Official ID Type
          </label>
          <UiSelect
            id="userOfficialType"
            v-model="formData.userOfficialType"
            :options="officialIdTypeOptions"
            placeholder="Select ID type"
            :error="getFieldError('userOfficialType')"
            :disabled="disabled"
            @blur="v$.userOfficialType?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="userOfficialIdIssuedDate"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Official ID Issued Date
          </label>
          <UiDateInput
            id="userOfficialIdIssuedDate"
            v-model="formData.userOfficialIdIssuedDate"
            placeholder="YYYY-MM-DD"
            :error="getFieldError('userOfficialIdIssuedDate')"
            :disabled="disabled"
            @blur="v$.userOfficialIdIssuedDate?.$touch"
          />
        </div>

        <div>
          <label
            for="userOfficialIdIssuedAuthority"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Official ID Issued Authority
          </label>
          <UiInput
            id="userOfficialIdIssuedAuthority"
            v-model="formData.userOfficialIdIssuedAuthority"
            placeholder="Enter issuing authority"
            :error="getFieldError('userOfficialIdIssuedAuthority')"
            :disabled="disabled"
            @blur="v$.userOfficialIdIssuedAuthority?.$touch"
          />
        </div>
      </div>
    </div>

    <!-- Current Address Information -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Current Address Information
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="currentAddressStreet" class="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <UiInput
            id="currentAddressStreet"
            v-model="formData.currentAddress.street"
            placeholder="Enter street"
            :error="getFieldError('currentAddress.street')"
            :disabled="disabled"
            @blur="v$.currentAddress.street?.$touch"
          />
        </div>

        <div>
          <label for="currentAddressNumber" class="block text-sm font-medium text-gray-700 mb-1">
            Number
          </label>
          <UiInput
            id="currentAddressNumber"
            v-model="formData.currentAddress.number"
            placeholder="Enter number"
            :error="getFieldError('currentAddress.number')"
            :disabled="disabled"
            @blur="v$.currentAddress.number?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="currentAddressCity" class="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <UiInput
            id="currentAddressCity"
            v-model="formData.currentAddress.city"
            placeholder="Enter city"
            :error="getFieldError('currentAddress.city')"
            :disabled="disabled"
            @blur="v$.currentAddress.city?.$touch"
          />
        </div>

        <div>
          <label for="currentAddressProvince" class="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <UiInput
            id="currentAddressProvince"
            v-model="formData.currentAddress.province"
            placeholder="Enter province"
            :error="getFieldError('currentAddress.province')"
            :disabled="disabled"
            @blur="v$.currentAddress.province?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="currentAddressZipCode" class="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code
          </label>
          <UiInput
            id="currentAddressZipCode"
            v-model="formData.currentAddress.zipCode"
            placeholder="Enter ZIP code"
            :error="getFieldError('currentAddress.zipCode')"
            :disabled="disabled"
            @blur="v$.currentAddress.zipCode?.$touch"
          />
        </div>

        <div>
          <label for="currentAddressCountry" class="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <UiCountrySelect
            id="currentAddressCountry"
            v-model="formData.currentAddress.country"
            placeholder="Search for a country..."
            :disabled="disabled"
          />
        </div>
      </div>
    </div>

    <!-- Permanent Residence Address -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Permanent Residence Address
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="permanentAddressStreet" class="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <UiInput
            id="permanentAddressStreet"
            v-model="formData.permanentResidenceAddress.street"
            placeholder="Enter street"
            :error="getFieldError('permanentResidenceAddress.street')"
            :disabled="disabled"
            @blur="v$.permanentResidenceAddress.street?.$touch"
          />
        </div>

        <div>
          <label for="permanentAddressNumber" class="block text-sm font-medium text-gray-700 mb-1">
            Number
          </label>
          <UiInput
            id="permanentAddressNumber"
            v-model="formData.permanentResidenceAddress.number"
            placeholder="Enter number"
            :error="getFieldError('permanentResidenceAddress.number')"
            :disabled="disabled"
            @blur="v$.permanentResidenceAddress.number?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="permanentAddressCity" class="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <UiInput
            id="permanentAddressCity"
            v-model="formData.permanentResidenceAddress.city"
            placeholder="Enter city"
            :error="getFieldError('permanentResidenceAddress.city')"
            :disabled="disabled"
            @blur="v$.permanentResidenceAddress.city?.$touch"
          />
        </div>

        <div>
          <label
            for="permanentAddressProvince"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Province
          </label>
          <UiInput
            id="permanentAddressProvince"
            v-model="formData.permanentResidenceAddress.province"
            placeholder="Enter province"
            :error="getFieldError('permanentResidenceAddress.province')"
            :disabled="disabled"
            @blur="v$.permanentResidenceAddress.province?.$touch"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="permanentAddressZipCode" class="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code
          </label>
          <UiInput
            id="permanentAddressZipCode"
            v-model="formData.permanentResidenceAddress.zipCode"
            placeholder="Enter ZIP code"
            :error="getFieldError('permanentResidenceAddress.zipCode')"
            :disabled="disabled"
            @blur="v$.permanentResidenceAddress.zipCode?.$touch"
          />
        </div>

        <div>
          <label for="permanentAddressCountry" class="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <UiCountrySelect
            id="permanentAddressCountry"
            v-model="formData.permanentResidenceAddress.country"
            placeholder="Search for a country..."
            :disabled="disabled"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading || disabled"
      >
        <span v-if="loading" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Saving...
        </span>
        <span v-else>Save Profile</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import UiInput from '@/common/components/UiInput.vue'
import UiSelect from '@/common/components/UiSelect.vue'
import UiDateInput from '@/common/components/UiDateInput.vue'
import UiCountrySelect from '@/common/components/UiCountrySelect.vue'
import { useUserForm, type UserFormData } from '@/common/composables/useUserForm'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    initialData?: Partial<UserFormData> | null
  }>(),
  {
    loading: false,
    disabled: false,
    initialData: () => ({}),
  },
)

const emit = defineEmits<{
  submit: [data: UserFormData]
  cancel: []
}>()

// Use the composable with initial data
const { formData, v$, getFieldError, validateForm } = useUserForm(props.initialData)

const officialIdTypeOptions = [
  { value: 'ID', label: 'ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENCE', label: 'Driving Licence' },
  { value: 'CYPRIOT_ID', label: 'Cypriot ID' },
  { value: 'REPATRIATED_GREEK_ID', label: 'Repatriated Greek ID' },
  { value: 'POLICE_ID', label: 'Police ID' },
  { value: 'SOLDIER_ID', label: 'Soldier ID' },
  { value: 'MILLITARY_ID', label: 'Military ID' },
  { value: 'OTHER', label: 'Other' },
]

const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const militaryObligationsOptions = [
  { value: 'OF_SERVICE', label: 'Of Service' },
  { value: 'COMPLETED', label: 'Completed' },
]

const maritalStatusOptions = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
]

async function handleSubmit() {
  const isValid = await validateForm()
  if (!isValid) return
  emit('submit', formData.value)
}
</script>
