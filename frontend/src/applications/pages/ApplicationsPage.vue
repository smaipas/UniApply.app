<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Applications</h1>
      <UiButton @click="goNew">New Application</UiButton>
    </div>
    <UiTable :columns="columns" :items="rows">
      <template #cell-status="{ value }">
        <span
          :class="{
            'text-gray-700': value === 'DRAFT',
            'text-blue-700': value === 'PENDING_APPROVAL',
            'text-green-700': value === 'APPROVED',
            'text-red-700': value === 'REJECTED',
          }"
          >{{ value }}</span
        >
      </template>
    </UiTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiTable from '@/common/components/UiTable.vue'
import UiButton from '@/common/components/UiButton.vue'
import api from '@/app/axios'

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
const router = useRouter()

async function fetchApplications() {
  const res = await api.get('/applications')
  rows.value = res.data as AppRow[]
}

function goNew() {
  router.push('/applications/new')
}

onMounted(fetchApplications)
</script>
