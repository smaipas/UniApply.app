<template>
  <div class="rounded-xs border border-gray-200 bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-base font-semibold">Pending Approvals</h3>
      <router-link to="/approvals" class="text-sm text-blue-700 hover:underline"
        >View all</router-link
      >
    </div>
    <div v-if="!items.length" class="py-8 text-center text-sm text-gray-500">
      No pending approvals 🎉
    </div>
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500">
          <th class="px-2 py-2">Application</th>
          <th class="px-2 py-2">Applicant</th>
          <th class="px-2 py-2">Updated</th>
          <th class="px-2 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in items" :key="a.id" class="border-t">
          <td class="px-2 py-2 font-medium">{{ a.formId }}</td>
          <td class="px-2 py-2">{{ a.userId }}</td>
          <td class="px-2 py-2">{{ formatDate(a.updatedAt || a.createdAt) }}</td>
          <td class="px-2 py-2">
            <span
              class="inline-flex items-center rounded-xs bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
              >Pending</span
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import type { Application } from '@uniapply/shared'

defineProps<{ items: Application[] }>()

function formatDate(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}
</script>
