<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Form Templates</h1>
      <UiButton :icon="mdiPlus" @click="goCreate">New Template</UiButton>
    </div>
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
      </UiTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import UiButton from '@/common/components/UiButton.vue'
import UiTable from '@/common/components/UiTable.vue'
import UiChip from '@/common/components/UiChip.vue'
import api from '@/app/axios'
import { mdiPlus } from '@mdi/js'
import type { FormTemplate } from '@uniapply/shared'

type TemplateRow = {
  id: string
  title: string
  active: boolean
  updatedAt?: string
}

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'active', label: 'Active' },
  { key: 'updatedAt', label: 'Updated' },
]

const rows = ref<TemplateRow[]>([])
const loading = ref(false)
const router = useRouter()

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch {
    return dateString
  }
}

async function fetchTemplates() {
  loading.value = true
  try {
    const res = await api.get('/forms')
    rows.value = (res.data as FormTemplate[]).map((t) => ({
      id: t.id,
      title: t.title,
      active: !!t.active,
      updatedAt: t.updatedAt,
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

onMounted(fetchTemplates)
</script>
