<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Form Templates</h1>
      <UiButton v-if="canViewFormTemplates" :icon="mdiPlus" @click="goCreate">
        <span class="hidden sm:inline">New Template</span>
        <span class="sm:hidden">New</span>
      </UiButton>
    </div>

    <!-- No Access Message -->
    <div v-if="!canViewFormTemplates" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <UiIcon :path="mdiFileDocumentOutline" class="mx-auto h-12 w-12" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No content available</h3>
      <p class="text-gray-600">You don't have permission to view form templates.</p>
    </div>

    <!-- Form Templates Content -->
    <div v-else>
      <div>
        <UiTable :columns="columns" :items="rows" :loading="loading" @row-click="handleRowClick">
          <template #cell-active="{ value }">
            <UiChip :color="value ? 'green' : 'red'">
              {{ value ? 'Active' : 'Inactive' }}
            </UiChip>
          </template>
          <template #cell-updatedAt="{ value }">
            {{ formatDate(value) }}
          </template>
          <template #cell-actions="{ row }">
            <UiButton
              v-if="canModifyFormTemplates"
              flat
              color="red"
              :icon="mdiClose"
              size="sm"
              @click.stop="handleDeleteClick(row)"
              title="Delete template"
            />
          </template>
        </UiTable>
      </div>

      <!-- Delete Confirmation Modal -->
      <UiModal v-model="showDeleteModal" title="Delete Form Template" size="sm">
        <div class="space-y-4">
          <p class="text-gray-700">
            Are you sure you want to delete the form template
            <strong>"{{ deletingTemplate?.title }}"</strong>?
          </p>
          <p class="text-sm text-gray-600">
            This action cannot be undone. If this template has any applications, they must be
            deleted first.
          </p>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UiButton flat @click="cancelDelete" :disabled="deleting"> Cancel </UiButton>
            <UiButton color="red" @click="confirmDelete" :disabled="deleting" :loading="deleting">
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </UiButton>
          </div>
        </template>
      </UiModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { UiButton, UiIcon } from '@/common/components'
import { UiTable, UiChip, UiModal } from '@/common/components'
import api from '@/app/axios'
import { mdiPlus, mdiClose, mdiFileDocumentOutline } from '@mdi/js'
import type { FormTemplate } from '@uniapply/shared'
import { useToastStore } from '@/common/store/toast'
import { useAuthStore } from '@/auth/store'
import { usePermissions } from '@/common/utils/permissions'

// Extended user type with access permissions
type UserWithAccess = {
  access?: {
    applications?: {
      create?: boolean
      update?: boolean
      delete?: boolean
      approve?: boolean
      reject?: boolean
      readAll?: boolean
      readOwn?: boolean
    }
    formTemplates?: {
      create?: boolean
      readAll?: boolean
      readActive?: boolean
      update?: boolean
      delete?: boolean
    }
    users?: {
      create?: boolean
      readAll?: boolean
      update?: boolean
      delete?: boolean
    }
    auditLogs?: {
      read?: boolean
    }
    systemSettings?: {
      read?: boolean
      update?: boolean
    }
    roles?: {
      readAll?: boolean
      create?: boolean
      update?: boolean
      delete?: boolean
    }
  }
}

type TemplateRow = {
  id: string
  title: string
  active: boolean
  updatedAt?: string
  version?: number
}

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'active', label: 'Active' },
  { key: 'updatedAt', label: 'Updated' },
  { key: 'version', label: 'Version' },
  { key: 'actions', label: '' },
]

const rows = ref<TemplateRow[]>([])
const loading = ref(false)
const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()
const { getUserPermissions } = usePermissions()

// Delete confirmation modal state
const showDeleteModal = ref(false)
const deletingTemplate = ref<TemplateRow | null>(null)
const deleting = ref(false)

// Permission checks
const canViewFormTemplates = computed(() => {
  const permissions = getUserPermissions()
  return permissions.formTemplates.readAll
})

const canModifyFormTemplates = computed(() => {
  return (authStore.profile as UserWithAccess)?.access?.formTemplates?.update || false
})

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch {
    return dateString
  }
}

async function fetchTemplates() {
  if (!canViewFormTemplates.value) return

  loading.value = true
  try {
    const res = await api.get('/forms')
    rows.value = (res.data as FormTemplate[]).map((t) => ({
      id: t.id,
      title: t.title,
      active: !!t.active,
      updatedAt: t.updatedAt,
      version: t.version,
    }))
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/form-templates/new')
}

function handleRowClick(row: Record<string, unknown>) {
  router.push(`/form-templates/${(row as TemplateRow).id}`)
}

function handleDeleteClick(template: Record<string, unknown>) {
  deletingTemplate.value = template as TemplateRow
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deletingTemplate.value) return

  deleting.value = true
  try {
    await api.delete(`/forms/${deletingTemplate.value.id}`)
    toastStore.success('Form template deleted successfully')
    await fetchTemplates() // Refresh the list
  } catch (error) {
    console.error('Failed to delete form template:', error)
    toastStore.error('Failed to delete form template')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
    deletingTemplate.value = null
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  deletingTemplate.value = null
}

onMounted(fetchTemplates)
</script>
