<template>
  <div class="bg-white rounded-xs shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">System Activity</h3>
        <router-link
          to="/settings/logs"
          class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all
        </router-link>
      </div>
    </div>

    <div class="p-6">
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-8">
        <div
          class="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <svg class="w-6 h-6 text-gray-400" viewBox="0 0 24 24">
            <path fill="currentColor" :d="ClipboardTextIcon" />
          </svg>
        </div>
        <p class="text-gray-500 text-sm">No recent activity</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-start space-x-3 p-3 rounded-xs hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0 mt-1">
            <div class="w-2 h-2 rounded-full" :class="getActionColor(item.action)"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">
                {{ formatAction(item.action) }}
              </p>
              <span class="text-xs text-gray-500">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>
            <p class="text-xs text-gray-600 mt-1">{{ item.entity }}: {{ item.entityId }}</p>
            <p v-if="item.userEmail" class="text-xs text-gray-500 mt-1">by {{ item.userEmail }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiClipboardTextOutline } from '@mdi/js'

// Create icon component
const ClipboardTextIcon = mdiClipboardTextOutline

interface AuditLog {
  id: string
  entity: string
  entityId: string
  action: string
  userEmail?: string
  createdAt: string
}

interface Props {
  items: AuditLog[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    CREATE: 'bg-green-300',
    UPDATE: 'bg-blue-300',
    DELETE: 'bg-red-300',
    APPROVE: 'bg-green-300',
    REJECT: 'bg-red-300',
    SUBMIT: 'bg-amber-300',
    LOGIN: 'bg-purple-300',
    LOGOUT: 'bg-gray-300',
  }
  return colors[action] || 'bg-gray-300'
}

function formatAction(action: string): string {
  return action.charAt(0) + action.slice(1).toLowerCase()
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>
