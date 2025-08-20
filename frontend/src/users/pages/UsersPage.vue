<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Users</h1>
    </div>
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
          <UiDropdownItem
            :label="row.active ? 'Deactivate' : 'Activate'"
            :icon="row.active ? mdiAccountOff : mdiAccountCheck"
            :variant="row.active ? 'warning' : 'default'"
            @click="showToggleStatusModal(row as UserRow)"
          />
          <UiDropdownItem
            label="Delete"
            :icon="mdiDelete"
            variant="danger"
            @click="showDeleteUserModal(row as UserRow)"
          />
        </UiDropdown>
      </template>
    </UiTable>

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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { mdiDotsVertical, mdiAccountOff, mdiAccountCheck, mdiDelete } from '@mdi/js'
import { UiTable, UiButton, UiModal, UiChip, UiDropdown, UiDropdownItem } from '@/common/components'
import { useToastStore } from '@/common/store/toast'
import { formatDateTime } from '@/common/utils/date'
import api from '@/app/axios'

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
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: '' }, // Empty label for actions column
]

const rows = ref<UserRow[]>([])
const showToggleModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<UserRow | null>(null)
const toggleLoading = ref(false)
const deleteLoading = ref(false)
const toastStore = useToastStore()

async function fetchUsers() {
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
  } catch (error: any) {
    console.error('Failed to toggle user status:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: error.response?.data?.message || 'Failed to update user status',
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
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: error.response?.data?.message || 'Failed to delete user',
    })
  } finally {
    deleteLoading.value = false
  }
}

onMounted(fetchUsers)
</script>
