<template>
  <UiCard title="Recent applications">
    <template v-if="items && items.length">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-600">
            <tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Form</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in items" :key="a.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-2">
                <router-link
                  :to="{ name: 'applications.view', params: { id: a.id } }"
                  class="text-primary hover:underline"
                >
                  {{ a.id }}
                </router-link>
              </td>
              <td class="px-4 py-2">{{ a.formId }}</td>
              <td class="px-4 py-2">
                <span
                  class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                  :class="statusClass(a.status)"
                >
                  {{ a.status }}
                </span>
              </td>
              <td class="px-4 py-2">
                {{ (a.updatedAt || a.createdAt)?.slice(0, 19).replace('T', ' ') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <div class="text-sm text-gray-600">No recent applications.</div>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { UiCard } from '@/common/components'
import type { Application } from '@uniapply/shared'

defineProps<{ items: Application[] }>()

function statusClass(s: Application['status']) {
  if (s === 'APPROVED') return 'bg-green-50 text-green-700'
  if (s === 'REJECTED') return 'bg-red-50 text-red-700'
  if (s === 'PENDING_APPROVAL') return 'bg-secondary/10 text-secondary'
  return 'bg-gray-100 text-gray-700'
}
</script>
