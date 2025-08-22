<template>
  <UiCard title="Recent applications">
    <template v-if="items && items.length">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs font-semibold text-gray-600">
            <tr>
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
                  {{ a.formTitle }}
                </router-link>
              </td>
              <td class="px-4 py-2">
                <StatusChip :status="a.status" />
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
import { UiCard, StatusChip } from '@/common/components'
import type { Application } from '@uniapply/shared'

defineProps<{ items: Application[] }>()
</script>
