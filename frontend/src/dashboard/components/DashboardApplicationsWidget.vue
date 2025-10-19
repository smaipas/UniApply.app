<template>
  <div class="bg-white rounded-xs shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <router-link
          v-if="viewAllLink"
          :to="viewAllLink"
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
          <UiIcon :path="emptyIconComponent" class="w-6 h-6 text-gray-400" />
        </div>
        <p class="text-gray-500 text-sm">{{ emptyMessage }}</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="group cursor-pointer"
          @click="handleItemClick(item)"
        >
          <div
            class="flex items-center justify-between p-4 rounded-xs border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ item.formTitle }}
                  </p>

                  <div class="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                    Applied by {{ `${item.user?.firstName} ${item.user?.lastName}` }} -
                    {{ formatDate(item.updatedAt || item.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-shrink-0 ml-4">
              <StatusChip :status="item.status" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { mdiFileDocumentOutline, mdiClockOutline } from '@mdi/js'
import { StatusChip, UiIcon } from '@/common/components'
import type { Application } from '@uniapply/shared'

// Create icon components
const FileDocumentIcon = mdiFileDocumentOutline
const ClockIcon = mdiClockOutline

interface Props {
  title: string
  items: Application[]
  loading?: boolean
  viewAllLink?: string
  emptyMessage?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No items found',
  emptyIcon: 'mdiFileDocumentOutline',
})

const emptyIconComponent = computed(() => {
  const iconMap: Record<string, string> = {
    mdiFileDocumentOutline: FileDocumentIcon,
    mdiClockOutline: ClockIcon,
  }
  return iconMap[props.emptyIcon as string] || FileDocumentIcon
})

const router = useRouter()

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

function handleItemClick(item: Application) {
  router.push(`/applications/${item.id}`)
}
</script>
