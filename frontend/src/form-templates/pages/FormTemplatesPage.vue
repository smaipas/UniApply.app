<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Form Templates</h1>
      <UiButton :icon="mdiPlus" @click="goCreate">New Template</UiButton>
    </div>
    <div>
      <UiTable :columns="columns" :items="rows" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiButton from '@/common/components/UiButton.vue'
import UiTable from '@/common/components/UiTable.vue'
import api from '@/app/axios'
import { mdiPlus } from '@mdi/js'
import type { FormTemplate } from '@uniapply/shared'

type TemplateRow = { id: string; title: string; active: boolean; updatedAt?: string }

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'active', label: 'Active' },
  { key: 'updatedAt', label: 'Updated' },
]

const rows = ref<TemplateRow[]>([])
const router = useRouter()

async function fetchTemplates() {
  const res = await api.get('/forms')
  rows.value = (res.data as FormTemplate[]).map((t) => ({
    id: t.id,
    title: t.title,
    active: !!t.active,
    updatedAt: t.updatedAt,
  }))
}

function goCreate() {
  router.push('/form-templates/new')
}

onMounted(fetchTemplates)
</script>
