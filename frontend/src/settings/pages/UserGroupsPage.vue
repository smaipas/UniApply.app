<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Groups</h1>
        <p class="text-gray-600 mt-1">Manage roles and their permissions</p>
      </div>
      <UiButton v-if="canModifyRoles" :icon="mdiPlus" @click="showAddRoleModal = true">
        Add User Group
      </UiButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Roles Tabs -->
    <div v-else-if="roles.length > 0">
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="role in roles"
            :key="role.roleName"
            @click="activeRole = role"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeRole?.roleName === role.roleName
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ role.roleLabel }}
          </button>
        </nav>
      </div>

      <!-- Role Permissions -->
      <div v-if="activeRole" class="space-y-6">
        <!-- Role Info -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                v-model="activeRole.roleName"
                :disabled="!canModifyRoles"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="e.g., MODERATOR"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Label</label>
              <input
                v-model="activeRole.roleLabel"
                :disabled="!canModifyRoles"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="e.g., Moderator"
              />
            </div>
          </div>
        </div>

        <!-- Permissions Grid -->
        <div class="space-y-6">
          <div
            v-for="(permissions, resource) in permissionGroups"
            :key="resource"
            class="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 class="text-lg font-medium text-gray-900 mb-4 capitalize">
              {{ resource.replace(/([A-Z])/g, ' $1').trim() }}
            </h3>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="(permission, key) in permissions"
                :key="key"
                class="flex items-center space-x-3"
              >
                <UiCheckbox
                  :model-value="activeRole.access[resource]?.[key] || false"
                  :disabled="!canModifyRoles"
                  @update:model-value="updatePermission(resource, key, $event)"
                />
                <label class="text-sm font-medium text-gray-700 capitalize">
                  {{ key.replace(/([A-Z])/g, ' $1').trim() }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div v-if="canModifyRoles" class="flex justify-end">
          <UiButton :icon="mdiFloppy" :loading="saving" @click="saveRole"> Save Changes </UiButton>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
      <p class="text-gray-600 mb-4">Get started by creating your first role.</p>
      <UiButton v-if="canModifyRoles" :icon="mdiPlus" @click="showAddRoleModal = true">
        Add User Group
      </UiButton>
    </div>

    <!-- Add Role Modal -->
    <UiModal v-model="showAddRoleModal" title="Add New User Group" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">User Group Name</label>
          <input
            v-model="newRole.roleName"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., MODERATOR"
            @input="updateRoleName"
          />
          <p class="text-xs text-gray-500 mt-1">Internal name (uppercase, no spaces)</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Display Label</label>
          <input
            v-model="newRole.roleLabel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Moderator"
          />
          <p class="text-xs text-gray-500 mt-1">Display name shown to users</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton flat @click="showAddRoleModal = false"> Cancel </UiButton>
          <UiButton
            :icon="mdiPlus"
            :loading="creating"
            :disabled="!newRole.roleName || !newRole.roleLabel"
            @click="createRole"
          >
            Create User Group
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { mdiPlus, mdiFloppy } from '@mdi/js'
import { useAuthStore } from '@/auth/store'
import { useToastStore } from '@/common/store/toast'
import { UiButton, UiCheckbox, UiModal } from '@/common/components'
import axios from '@/app/axios'

// Types
type Role = {
  roleName: string
  roleLabel: string
  access: {
    applications: {
      create: boolean
      update: boolean
      delete: boolean
      approve: boolean
      reject: boolean
      readAll: boolean
      readOwn: boolean
    }
    formTemplates: {
      create: boolean
      readAll: boolean
      readActive: boolean
      update: boolean
      delete: boolean
    }
    users: {
      create: boolean
      readAll: boolean
      update: boolean
      delete: boolean
    }
    auditLogs: {
      read: boolean
    }
    systemSettings: {
      read: boolean
      update: boolean
    }
    roles: {
      readAll: boolean
      create: boolean
      update: boolean
      delete: boolean
    }
  }
}

// Stores
const authStore = useAuthStore()
const toastStore = useToastStore()

// Reactive data
const roles = ref<Role[]>([])
const activeRole = ref<Role | null>(null)
const loading = ref(false)
const saving = ref(false)
const creating = ref(false)
const showAddRoleModal = ref(false)
const newRole = ref({
  roleName: '',
  roleLabel: '',
})

// Computed
const canModifyRoles = computed(() => authStore.profile?.access?.roles?.update)

const permissionGroups = computed(() => ({
  applications: {
    create: 'Create Applications',
    update: 'Update Applications',
    delete: 'Delete Applications',
    approve: 'Approve Applications',
    reject: 'Reject Applications',
    readAll: 'View All Applications',
    readOwn: 'View Own Applications',
  },
  formTemplates: {
    create: 'Create Form Templates',
    readAll: 'View All Form Templates',
    readActive: 'View Active Form Templates',
    update: 'Update Form Templates',
    delete: 'Delete Form Templates',
  },
  users: {
    create: 'Create Users',
    readAll: 'View All Users',
    update: 'Update Users',
    delete: 'Delete Users',
  },
  auditLogs: {
    read: 'View Audit Logs',
  },
  systemSettings: {
    read: 'View System Settings',
    update: 'Update System Settings',
  },
  roles: {
    readAll: 'View All Roles',
    create: 'Create Roles',
    update: 'Update Roles',
    delete: 'Delete Roles',
  },
}))

// Methods
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await axios.get('/roles')
    roles.value = response.data
    if (roles.value.length > 0 && !activeRole.value) {
      activeRole.value = roles.value[0]
    }
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    toastStore.show({
      type: 'error',
      title: 'Error',
      message: 'Failed to load user groups',
    })
  } finally {
    loading.value = false
  }
}

const updatePermission = (resource: string, permission: string, value: boolean) => {
  if (!activeRole.value) return
  if (!activeRole.value.access[resource]) {
    activeRole.value.access[resource] = {} as any
  }
  activeRole.value.access[resource][permission] = value
}

const saveRole = async () => {
  if (!activeRole.value) return
  saving.value = true
  try {
    // Extract only the fields that can be updated (exclude createdAt, updatedAt)
    const { createdAt, updatedAt, ...updatableFields } = activeRole.value
    await axios.put(`/roles/${activeRole.value.roleName}`, updatableFields)
    toastStore.show({
      type: 'success',
      title: 'Success',
      message: 'User group updated successfully',
    })
  } catch (error) {
    console.error('Failed to save role:', error)
    toastStore.show({
      type: 'error',
      title: 'Error',
      message: 'Failed to update user group',
    })
  } finally {
    saving.value = false
  }
}

const createRole = async () => {
  creating.value = true
  try {
    const response = await axios.post('/roles', newRole.value)
    const createdRole = response.data
    roles.value.push(createdRole)
    activeRole.value = createdRole
    showAddRoleModal.value = false
    newRole.value = { roleName: '', roleLabel: '' }
    toastStore.show({
      type: 'success',
      title: 'Success',
      message: 'User group created successfully',
    })
  } catch (error) {
    console.error('Failed to create role:', error)
    toastStore.show({
      type: 'error',
      title: 'Error',
      message: 'Failed to create user group',
    })
  } finally {
    creating.value = false
  }
}

const updateRoleName = () => {
  newRole.value.roleName = newRole.value.roleName.toUpperCase().replace(/\s+/g, '')
}

// Lifecycle
onMounted(() => {
  fetchRoles()
})
</script>
