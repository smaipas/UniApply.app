<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Applications</h1>
      <UiButton @click="showTemplateSelector = true" :icon="mdiPlus">New Application</UiButton>
    </div>
    <UiTable :columns="columns" :items="rows">
      <template #cell-status="{ value }">
        <UiChip :variant="getStatusVariant(value)" size="sm">
          {{ value.replace('_', ' ').toLowerCase() }}
        </UiChip>
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
import { UiTable, UiButton, UiChip, FormTemplateSelector } from '@/common/components'
import { formatDateTime } from '@/common/utils/date'
import api from '@/app/axios'
import { mdiPlus } from '@mdi/js'

type AppRow = {
  id: string
  formId: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  updatedAt?: string
}

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'formId', label: 'Form' },
  { key: 'status', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
]

const rows = ref<AppRow[]>([])
const showTemplateSelector = ref(false)

async function fetchApplications() {
  const res = await api.get('/applications')
  rows.value = res.data as AppRow[]
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

onMounted(fetchApplications)
</script>
