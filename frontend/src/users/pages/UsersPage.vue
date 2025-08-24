<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Users</h1>
    </div>

    <!-- No Access Message -->
    <div v-if="!canViewUsers" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No content available</h3>
      <p class="text-gray-600">You don't have permission to view users.</p>
    </div>

    <!-- Users Table -->
    <div v-else>
      <UiTable :columns="columns" :items="rows">
        <template #cell-active="{ value }">
          <UiChip :variant="value ? 'success' : 'gray'" size="sm">
            {{ value ? 'Active' : 'Inactive' }}
          </UiChip>
        </template>
        <template #cell-createdAt="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-actions="{ row }">
          <UiDropdown placement="left" width="w-48">
            <template #trigger="{ toggle }">
              <UiButton flat size="md" :icon="mdiDotsVertical" @click="toggle" />
            </template>
            <template #default="{ close }">
              <UiDropdownItem
                label="Change user group"
                :icon="mdiAccountGroup"
                class="cursor-pointer"
                @click="
                  () => {
                    openChangeRoleModal(row as UserRow)
                    close()
                  }
                "
              />
              <UiDropdownItem
                :label="row.active ? 'Deactivate' : 'Activate'"
                :icon="row.active ? mdiAccountOff : mdiAccountCheck"
                :variant="row.active ? 'warning' : 'default'"
                class="cursor-pointer"
                @click="
                  () => {
                    showToggleStatusModal(row as UserRow)
                    close()
                  }
                "
              />
              <UiDropdownItem
                label="Delete"
                :icon="mdiDelete"
                variant="danger"
                class="cursor-pointer"
                @click="
                  () => {
                    showDeleteUserModal(row as UserRow)
                    close()
                  }
                "
              />
            </template>
          </UiDropdown>
        </template>
      </UiTable>
    </div>

    <!-- Toggle Status Confirmation Modal -->
    <UiModal v-model="showToggleModal" title="Confirm Status Change" size="sm">
      <div class="space-y-4">
        <p class="text-gray-700">
          Are you sure you want to
          <span class="font-semibold">{{ selectedUser?.active ? 'deactivate' : 'activate' }}</span>
          the user <span class="font-semibold">{{ selectedUser?.email }}</span
          >?
        </p>
        <p v-if="selectedUser?.active" class="text-sm text-gray-600">
          This user will no longer be able to access the application.
        </p>
        <p v-else class="text-sm text-gray-600">
          This user will be able to access the application again.
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton flat @click="showToggleModal = false">Cancel</UiButton>
          <UiButton
            :color="selectedUser?.active ? 'red' : 'green'"
            :loading="toggleLoading"
            @click="toggleUserStatus"
          >
            {{ selectedUser?.active ? 'Deactivate' : 'Activate' }}
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="showDeleteModal" title="Confirm User Deletion" size="sm">
      <div class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Irreversible Action</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>
                  This action cannot be undone. All resources created by this user will be
                  permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
        <p class="text-gray-700">
          Are you sure you want to delete the user
          <span class="font-semibold">{{ selectedUser?.email }}</span
          >?
        </p>
        <div class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm text-gray-600">
            <strong>This will permanently delete:</strong>
          </p>
          <ul class="text-sm text-gray-600 mt-1 list-disc list-inside">
            <li>The user account</li>
            <li>All applications created by this user</li>
            <li>All associated data and files</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton flat @click="showDeleteModal = false">Cancel</UiButton>
          <UiButton color="red" :loading="deleteLoading" @click="deleteUser">
            Delete Permanently
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Change User Group Modal -->
    <UiModal v-model="showChangeRoleModal" title="Change User Group" size="sm">
      <div class="space-y-4">
        <p class="text-gray-700">
          Change the user group for <span class="font-semibold">{{ selectedUser?.email }}</span>
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Current User Group</label>
          <div class="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            {{ selectedUser?.role || 'No group assigned' }}
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New User Group</label>
          <UiSelect
            v-model="newRole"
            :options="roleOptions"
            placeholder="Select a user group"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton flat @click="showChangeRoleModal = false">Cancel</UiButton>
          <UiButton :loading="changeRoleLoading" :disabled="!newRole" @click="changeUserRole">
            Change User Group
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import {
  mdiDotsVertical,
  mdiAccountOff,
  mdiAccountCheck,
  mdiDelete,
  mdiAccountGroup,
} from '@mdi/js'
import {
  UiTable,
  UiButton,
  UiModal,
  UiChip,
  UiDropdown,
  UiDropdownItem,
  UiSelect,
} from '@/common/components'
import { useToastStore } from '@/common/store/toast'
import { usePermissions } from '@/common/utils/permissions'
import { formatDateTime } from '@/common/utils/date'
import { useRolesStore } from '@/common/store/roles'
import { useAuthStore } from '@/auth/store'
import api from '@/app/axios'

// Backend error response type
interface ApiErrorResponse {
  message: string
  errors?: unknown
}

type UserRow = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  active?: boolean
  createdAt?: string
}

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'role', label: 'User Group' },
  { key: 'active', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: '' }, // Empty label for actions column
]

const rows = ref<UserRow[]>([])
const showToggleModal = ref(false)
const showDeleteModal = ref(false)
const showChangeRoleModal = ref(false)
const selectedUser = ref<UserRow | null>(null)
const toggleLoading = ref(false)
const deleteLoading = ref(false)
const changeRoleLoading = ref(false)
const newRole = ref('')
const toastStore = useToastStore()
const authStore = useAuthStore()
const rolesStore = useRolesStore()
const { getUserPermissions } = usePermissions()

// Check if user can view users
const canViewUsers = computed(() => {
  const permissions = getUserPermissions()
  return permissions.users.readAll
})

// Role options for the dropdown
const roleOptions = computed(() => {
  return rolesStore.roles.map((role) => ({
    value: role.roleName,
    label: role.roleName,
  }))
})

async function fetchUsers() {
  if (!canViewUsers.value) return

  try {
    const res = await api.get('/users')
    rows.value = res.data as UserRow[]
  } catch (error) {
    console.error('Failed to fetch users:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to load users',
    })
  }
}

function showToggleStatusModal(user: UserRow) {
  selectedUser.value = user
  showToggleModal.value = true
}

function showDeleteUserModal(user: UserRow) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function openChangeRoleModal(user: UserRow) {
  selectedUser.value = user
  newRole.value = ''
  showChangeRoleModal.value = true
}

async function toggleUserStatus() {
  if (!selectedUser.value) return

  toggleLoading.value = true
  try {
    const res = await api.put(`/users/${selectedUser.value.id}/toggle-status`)

    // Update the user in the local state
    const userIndex = rows.value.findIndex((u) => u.id === selectedUser.value?.id)
    if (userIndex !== -1) {
      rows.value[userIndex].active = res.data.active
    }

    toastStore.show({
      tone: 'success',
      title: 'Success',
      message: res.data.message,
    })

    showToggleModal.value = false
    selectedUser.value = null
  } catch (error: unknown) {
    console.error('Failed to toggle user status:', error)
    const errorMessage =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: ApiErrorResponse } }).response?.data?.message
        : 'Failed to update user status'
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: errorMessage,
    })
  } finally {
    toggleLoading.value = false
  }
}

async function deleteUser() {
  if (!selectedUser.value) return

  deleteLoading.value = true
  try {
    await api.delete(`/users/${selectedUser.value.id}`)

    // Remove the user from the local state
    const userIndex = rows.value.findIndex((u) => u.id === selectedUser.value?.id)
    if (userIndex !== -1) {
      rows.value.splice(userIndex, 1)
    }

    toastStore.show({
      tone: 'success',
      title: 'Success',
      message: 'User and all associated resources deleted successfully',
    })

    showDeleteModal.value = false
    selectedUser.value = null
  } catch (error: unknown) {
    console.error('Failed to delete user:', error)
    const errorMessage =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: ApiErrorResponse } }).response?.data?.message
        : 'Failed to delete user'
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: errorMessage,
    })
  } finally {
    deleteLoading.value = false
  }
}

async function changeUserRole() {
  if (!selectedUser.value || !newRole.value) return

  changeRoleLoading.value = true
  try {
    await api.put(`/users/${selectedUser.value.id}`, {
      role: newRole.value,
    })

    // Update the user in the local state
    const userIndex = rows.value.findIndex((u) => u.id === selectedUser.value?.id)
    if (userIndex !== -1) {
      rows.value[userIndex].role = newRole.value
    }

    toastStore.show({
      tone: 'success',
      title: 'Success',
      message: 'User group updated successfully',
    })

    showChangeRoleModal.value = false
    selectedUser.value = null
    newRole.value = ''
  } catch (error: unknown) {
    console.error('Failed to change user role:', error)
    const errorMessage =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: ApiErrorResponse } }).response?.data?.message
        : 'Failed to update user group'
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: errorMessage,
    })
  } finally {
    changeRoleLoading.value = false
  }
}

// Watch for authentication and roles to be loaded
watch(
  [() => authStore.profile?.role, () => rolesStore.roles.length],
  ([userRole, rolesCount]) => {
    if (userRole && rolesCount > 0) {
      fetchUsers()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await rolesStore.ensureLoaded()
})
</script>
