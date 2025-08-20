<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Users</h1>
    </div>
    <UiTable :columns="columns" :items="rows">
      <template #cell-active="{ value }">
        <span :class="value ? 'text-green-700' : 'text-gray-500'">{{
          value ? 'Active' : 'Inactive'
        }}</span>
      </template>
    </UiTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { UiTable } from '@/common/components'
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
]

const rows = ref<UserRow[]>([])

async function fetchUsers() {
  const res = await api.get('/users')
  rows.value = res.data as UserRow[]
}

onMounted(fetchUsers)
</script>
