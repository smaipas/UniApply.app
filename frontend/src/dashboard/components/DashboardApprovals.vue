<template>
  <UiCard title="Pending approvals">
    <template v-if="items && items.length">
      <ul class="divide-y">
        <li v-for="a in items" :key="a.id" class="flex items-center justify-between gap-3 py-3">
          <div class="min-w-0">
            <div class="truncate text-sm font-medium text-gray-900">
              {{ a.formTitle }}
            </div>
            <div class="text-xs text-gray-600">
              From:
              {{
                a.user
                  ? `${a.user.firstName} ${a.user.lastName}${a.user.studentId ? ` (${a.user.studentId})` : ''}`
                  : a.userId
              }}
              •
              {{ (a.updatedAt || a.createdAt)?.slice(0, 19).replace('T', ' ') }}
            </div>
          </div>
          <div class="shrink-0">
            <router-link
              :to="{ name: 'applications.view', params: { id: a.id } }"
              class="text-primary hover:underline text-sm"
            >
              Review
            </router-link>
          </div>
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="text-sm text-gray-600">No items awaiting your approval.</div>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { UiCard } from '@/common/components'
import type { Application } from '@uniapply/shared'

defineProps<{ items: Application[] }>()
</script>
