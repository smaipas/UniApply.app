<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p class="text-gray-600 mt-1">View system activity and changes</p>
      </div>
    </div>

    <!-- No Access Message -->
    <div v-if="!canViewLogs" class="text-center py-12">
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
      <p class="text-gray-600">You don't have permission to view audit logs.</p>
    </div>

    <!-- Logs Content -->
    <div v-else>
      <!-- Filters -->
      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Entity</label>
            <UiSelect
              v-model="filters.entity"
              :options="entityOptions"
              placeholder="All entities"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <UiSelect v-model="filters.action" :options="actionOptions" placeholder="All actions" />
          </div>
          <div>
            <UiDateInput
              v-model="filters.dateFrom"
              label="Date From"
              placeholder="Select start date"
            />
          </div>
          <div>
            <UiDateInput v-model="filters.dateTo" label="Date To" placeholder="Select end date" />
          </div>
          <div class="flex items-end">
            <UiButton flat @click="clearFilters" class="w-full">Clear Filters</UiButton>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Logs Table -->
      <div v-else>
        <UiTable
          :columns="tableHeaders"
          :items="logs"
          :loading="loading"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <template #cell-entity="{ value }">
            <UiChip :color="getEntityColor(value)" :bordered="true">
              {{ value }}
            </UiChip>
          </template>

          <template #cell-action="{ value }">
            <UiChip :color="getActionColor(value)" :bordered="true">
              {{ value }}
            </UiChip>
          </template>

          <template #cell-user="{ value }">
            <span class="font-medium text-gray-900">{{ value }}</span>
          </template>

          <template #cell-changes="{ value }">
            <UiButton
              flat
              size="sm"
              @click="viewChanges(value)"
              :disabled="!value || Object.keys(value).length === 0"
            >
              {{ Object.keys(value || {}).length > 0 ? 'View Changes' : 'No Changes' }}
            </UiButton>
          </template>

          <template #cell-createdAt="{ value }">
            <span class="text-gray-600">{{ formatDate(value) }}</span>
          </template>
        </UiTable>

        <!-- Pagination -->
        <div v-if="logs.length > 0" class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-600">
            Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of
            {{ total }} logs
          </div>
          <div class="flex space-x-2">
            <UiButton flat :disabled="page <= 1" @click="previousPage">Previous</UiButton>
            <UiButton flat :disabled="!hasMore" @click="nextPage">Next</UiButton>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="logs.length === 0 && !loading" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p class="text-gray-600">No audit logs match your current filters.</p>
        </div>
      </div>

      <!-- Changes Modal -->
      <UiModal v-model="showChangesModal" title="Changes Details" size="lg">
        <div v-if="selectedChanges" class="space-y-4">
          <div
            v-for="(change, key) in selectedChanges"
            :key="key"
            class="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <h4 class="font-medium text-gray-900 mb-2 capitalize">
              {{ key.replace(/([A-Z])/g, ' $1').trim() }}
            </h4>
            <div class="bg-gray-50 p-3 rounded-md">
              <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{
                JSON.stringify(change, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </UiModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { useAuthStore } from '@/auth/store'
import { useToastStore } from '@/common/store/toast'
import { usePermissions } from '@/common/utils/permissions'
import { UiButton, UiChip, UiModal, UiSelect, UiTable, UiDateInput } from '@/common/components'
import axios from '@/app/axios'

// Types
type Log = {
  id: string
  entity: string
  action: string
  userId: string
  userEmail: string
  changes: Record<string, any>
  createdAt: string
}

type Filters = {
  entity: string
  action: string
  dateFrom: string
  dateTo: string
}

// Stores
const authStore = useAuthStore()
const toastStore = useToastStore()
const { getUserPermissions } = usePermissions()

// Reactive data
const logs = ref<Log[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const hasMore = ref(false)
const showChangesModal = ref(false)
const selectedChanges = ref<Record<string, any> | null>(null)

const filters = ref<Filters>({
  entity: '',
  action: '',
  dateFrom: '',
  dateTo: '',
})

// Computed
const canViewLogs = computed(() => {
  const permissions = getUserPermissions()
  return permissions.auditLogs.read
})

const tableHeaders = computed(() => [
  { key: 'entity', label: 'Entity' },
  { key: 'action', label: 'Action' },
  { key: 'user', label: 'User' },
  { key: 'changes', label: 'Changes' },
  { key: 'createdAt', label: 'Date' },
])

const entityOptions = computed(() => [
  { value: '', label: 'All entities' },
  { value: 'APPLICATION', label: 'Application' },
  { value: 'FORM_TEMPLATE', label: 'Form Template' },
  { value: 'USER', label: 'User' },
])

const actionOptions = computed(() => [
  { value: '', label: 'All actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'SUBMIT', label: 'Submit' },
])

// Methods
const fetchLogs = async () => {
  if (!canViewLogs.value) return

  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString(),
    })

    if (filters.value.entity) params.append('entity', filters.value.entity)
    if (filters.value.action) params.append('action', filters.value.action)
    if (filters.value.dateFrom) params.append('dateFrom', filters.value.dateFrom)
    if (filters.value.dateTo) params.append('dateTo', filters.value.dateTo)

    const response = await axios.get(`/audit-logs?${params.toString()}`)
    const { items, total: totalCount, hasMore: hasMorePages } = response.data

    logs.value = items.map((log: any) => ({
      ...log,
      user: log.userEmail,
      changes: log.details || log.changed || {},
    }))
    total.value = totalCount
    hasMore.value = hasMorePages
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    toastStore.show({
      type: 'error',
      title: 'Error',
      message: 'Failed to load audit logs',
    })
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    entity: '',
    action: '',
    dateFrom: '',
    dateTo: '',
  }
  page.value = 1
}

const previousPage = () => {
  if (page.value > 1) {
    page.value--
  }
}

const nextPage = () => {
  if (hasMore.value) {
    page.value++
  }
}

const getEntityColor = (entity: string) => {
  const colors: Record<string, string> = {
    APPLICATION: 'blue',
    FORM_TEMPLATE: 'green',
    USER: 'purple',
  }
  return colors[entity] || 'gray'
}

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    CREATE: 'green',
    UPDATE: 'blue',
    DELETE: 'red',
    APPROVE: 'green',
    REJECT: 'red',
    SUBMIT: 'blue',
  }
  return colors[action] || 'gray'
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch {
    return dateString
  }
}

const viewChanges = (changes: Record<string, any>) => {
  console.log('Viewing changes:', changes)
  selectedChanges.value = changes
  showChangesModal.value = true
}

// Watchers
watch(
  filters,
  () => {
    page.value = 1
    fetchLogs()
  },
  { deep: true },
)

watch(page, () => {
  fetchLogs()
})

// Watch for auth profile changes
watch(
  () => authStore.profile,
  (newProfile) => {
    if (newProfile && canViewLogs.value) {
      fetchLogs()
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  // Only fetch if we already have the profile and permissions
  if (authStore.profile && canViewLogs.value) {
    fetchLogs()
  }
})
</script>
