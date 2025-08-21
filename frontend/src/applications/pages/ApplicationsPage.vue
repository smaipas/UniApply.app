<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Applications</h1>
      <UiButton @click="showTemplateSelector = true" :icon="mdiPlus">New Application</UiButton>
    </div>
    <UiTable :columns="columns" :items="rows" @row-click="handleRowClick">
      <template #cell-status="{ value }">
        <UiChip :variant="getStatusVariant(value)" size="sm">
          {{ value.replace('_', ' ').toLowerCase() }}
        </UiChip>
      </template>
      <template #cell-form="{ value, row }">
        <div class="flex items-center">
          <span class="font-medium">{{ value }}</span>
          <span class="text-gray-400 text-sm ml-2">v{{ row.formVersion }}</span>
        </div>
      </template>
      <template #cell-createdAt="{ value }">
        {{ formatDateTime(value) }}
      </template>
      <template #cell-updatedAt="{ value }">
        {{ formatDateTime(value) }}
      </template>
    </UiTable>

    <!-- Form Template Selector Modal -->
    <FormTemplateSelector v-model="showTemplateSelector" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiTable, UiButton, UiChip, FormTemplateSelector } from '@/common/components'
import { formatDateTime } from '@/common/utils/date'
import api from '@/app/axios'
import { mdiPlus } from '@mdi/js'

type AppRow = {
  id: string
  formTitle: string
  formVersion: number
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

const columns = [
  { key: 'form', label: 'Form' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
]

const rows = ref<AppRow[]>([])
const showTemplateSelector = ref(false)
const router = useRouter()

async function fetchApplications() {
  const res = await api.get('/applications')
  const mappedData = res.data.map((app: any) => ({
    id: app.id,
    form: app.formTitle,
    formVersion: app.formVersion,
    status: app.status,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  })) as AppRow[]

  // Sort by updatedAt (most recent first)
  rows.value = mappedData.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'gray'
    case 'PENDING_APPROVAL':
      return 'warning'
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    default:
      return 'gray'
  }
}

function handleRowClick(row: Record<string, any>) {
  router.push(`/applications/${row.id}`)
}

onMounted(fetchApplications)
</script>
