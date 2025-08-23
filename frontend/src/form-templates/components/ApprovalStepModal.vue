<template>
  <UiModal v-model="isOpen" title="Add Approval Step">
    <div class="space-y-6">
      <!-- Step Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Select Approval Step Type
        </label>
        <div class="space-y-3">
          <label
            v-for="type in approvalStepTypes"
            :key="type.value"
            class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'border-primary bg-primary/5': selectedType === type.value }"
          >
            <input type="radio" :value="type.value" v-model="selectedType" class="mr-3" />
            <div>
              <div class="font-medium text-gray-900">{{ type.label }}</div>
              <div class="text-sm text-gray-600">{{ type.description }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- USER_GROUP Configuration -->
      <div v-if="selectedType === 'USER_GROUP'" class="space-y-4">
        <UiSelect
          label="User Group (Role)"
          v-model="userGroupRole"
          :options="availableRoles.map((r) => ({ label: r, value: r }))"
          placeholder="Select a role..."
          :error="userGroupError"
        />
      </div>

      <!-- FIXED_USER Configuration -->
      <div v-if="selectedType === 'FIXED_USER'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Search for User </label>
          <UiInput
            v-model="userSearchQuery"
            placeholder="Search by name or email..."
            @input="searchUsers"
            :error="fixedUserError"
          />
        </div>

        <div v-if="searchResults.length > 0" class="max-h-48 overflow-y-auto border rounded-lg">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            @click="selectUser(user)"
          >
            <div>
              <div class="font-medium">{{ user.firstName }} {{ user.lastName }}</div>
              <div class="text-sm text-gray-600">{{ user.email }}</div>
              <div class="text-xs text-gray-500">Role: {{ user.role }}</div>
            </div>
            <UiIcon :path="mdiCheck" v-if="selectedUser?.id === user.id" class="text-primary" />
          </div>
        </div>

        <div
          v-if="userSearchQuery && searchResults.length === 0 && !searching"
          class="text-sm text-gray-500"
        >
          No users found matching "{{ userSearchQuery }}"
        </div>

        <div v-if="searching" class="text-sm text-gray-500">Searching...</div>
      </div>

      <!-- DYNAMIC_USER Configuration -->
      <div v-if="selectedType === 'DYNAMIC_USER'" class="space-y-4">
        <UiSelect
          label="User Group (Role)"
          v-model="dynamicUserRole"
          :options="availableRoles.map((r) => ({ label: r, value: r }))"
          placeholder="Select a role..."
        />
        <UiInput
          label="Label"
          v-model="dynamicUserLabel"
          placeholder="e.g., Responsible Moderator, Department Head"
          :error="dynamicUserError"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <UiButton flat @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!canSave" @click="saveStep"> Add Step </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { UiModal, UiButton, UiInput, UiSelect, UiIcon } from '@/common/components'
import { mdiCheck } from '@mdi/js'
import api from '@/app/axios'
import { debounce } from 'lodash-es'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface ApprovalStep {
  type: 'USER_GROUP' | 'FIXED_USER' | 'DYNAMIC_USER'
  role?: string
  user?: {
    id: string
    firstName: string
    lastName: string
  }
  label?: string
}

const props = defineProps<{
  modelValue: boolean
  availableRoles: string[]
  existingSteps: ApprovalStep[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  add: [step: ApprovalStep]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Step type selection
const approvalStepTypes = [
  {
    value: 'USER_GROUP',
    label: 'User Group',
    description: 'Any user with the specified role can approve this step',
  },
  {
    value: 'FIXED_USER',
    label: 'Fixed User',
    description: 'A specific user must approve this step',
  },
  {
    value: 'DYNAMIC_USER',
    label: 'Dynamic User',
    description: 'The application creator specifies who approves this step',
  },
]

const selectedType = ref<'USER_GROUP' | 'FIXED_USER' | 'DYNAMIC_USER'>('USER_GROUP')

// USER_GROUP configuration
const userGroupRole = ref('')

// FIXED_USER configuration
const userSearchQuery = ref('')
const searchResults = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const searching = ref(false)

// DYNAMIC_USER configuration
const dynamicUserRole = ref('')
const dynamicUserLabel = ref('')

// Validation
const userGroupError = computed(() => {
  if (selectedType.value === 'USER_GROUP' && !userGroupRole.value) {
    return 'Please select a role'
  }
  if (selectedType.value === 'USER_GROUP' && isRoleAlreadyUsed(userGroupRole.value)) {
    return 'This role is already used in another step'
  }
  return ''
})

const fixedUserError = computed(() => {
  if (selectedType.value === 'FIXED_USER' && !selectedUser.value) {
    return 'Please select a user'
  }
  return ''
})

const dynamicUserError = computed(() => {
  if (selectedType.value === 'DYNAMIC_USER' && !dynamicUserRole.value) {
    return 'Please select a role'
  }
  if (selectedType.value === 'DYNAMIC_USER' && !dynamicUserLabel.value.trim()) {
    return 'Please provide a label'
  }
  if (selectedType.value === 'DYNAMIC_USER' && isRoleAlreadyUsed(dynamicUserRole.value)) {
    return 'This role is already used in another step'
  }
  return ''
})

const canSave = computed(() => {
  switch (selectedType.value) {
    case 'USER_GROUP':
      return userGroupRole.value && !userGroupError.value
    case 'FIXED_USER':
      return selectedUser.value && !fixedUserError.value
    case 'DYNAMIC_USER':
      return dynamicUserRole.value && dynamicUserLabel.value.trim() && !dynamicUserError.value
    default:
      return false
  }
})

// Check if role is already used in existing steps
function isRoleAlreadyUsed(role: string): boolean {
  return props.existingSteps.some((step) => {
    if (step.type === 'USER_GROUP' || step.type === 'DYNAMIC_USER') {
      return step.role === role
    }
    return false
  })
}

// User search functionality
const searchUsers = debounce(async () => {
  if (!userSearchQuery.value || userSearchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(userSearchQuery.value)}`)
    searchResults.value = response.data
  } catch (error) {
    console.error('Error searching users:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}, 300)

function selectUser(user: User) {
  selectedUser.value = user
}

// Save the approval step
function saveStep() {
  if (!canSave.value) return

  let step: ApprovalStep

  switch (selectedType.value) {
    case 'USER_GROUP':
      step = {
        type: 'USER_GROUP',
        role: userGroupRole.value,
      }
      break
    case 'FIXED_USER':
      if (!selectedUser.value) return
      step = {
        type: 'FIXED_USER',
        user: {
          id: selectedUser.value.id,
          firstName: selectedUser.value.firstName,
          lastName: selectedUser.value.lastName,
        },
      }
      break
    case 'DYNAMIC_USER':
      step = {
        type: 'DYNAMIC_USER',
        role: dynamicUserRole.value,
        label: dynamicUserLabel.value.trim(),
      }
      break
    default:
      return
  }

  emit('add', step)
  isOpen.value = false
  resetForm()
}

// Reset form when modal closes
watch(
  () => props.modelValue,
  (newShow) => {
    if (!newShow) {
      resetForm()
    }
  },
)

function resetForm() {
  selectedType.value = 'USER_GROUP'
  userGroupRole.value = ''
  userSearchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  dynamicUserRole.value = ''
  dynamicUserLabel.value = ''
}
</script>
