<template>
  <UiModal v-model="isOpen" title="Search" size="xl" :close-on-overlay="true">
    <div class="space-y-4">
      <!-- Search Input -->
      <div class="relative">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search applications, users, forms..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          @input="handleSearch"
          @keydown.esc="closeSearch"
          @keydown.enter="handleEnter"
          @keydown.ctrl.period.prevent="closeSearch"
        />
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
          <UiIcon :path="mdiMagnify" class="w-5 h-5 text-gray-400" />
        </div>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <UiIcon :path="mdiClose" class="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"
        ></div>
        <span class="ml-3 text-gray-600">Searching...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500 mb-2">
          <UiIcon :path="mdiAlertCircle" class="w-8 h-8 mx-auto" />
        </div>
        <p class="text-gray-600">{{ error }}</p>
      </div>

      <!-- Results -->
      <div v-else-if="results.length > 0" class="space-y-6">
        <div v-for="(group, type) in groupedResults" :key="type" class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {{ getTypeLabel(type) }} ({{ group.length }})
          </h3>
          <div class="space-y-1">
            <div
              v-for="result in group"
              :key="`${result.type}-${result.id}`"
              class="p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all"
              @click="navigateToResult(result)"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-1">
                  <UiIcon :path="getTypeIcon(result.type)" class="w-5 h-5 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 mb-1">
                    <span v-html="highlightText(result.title, searchQuery)"></span>
                  </h4>
                  <p v-if="result.subtitle" class="text-sm text-gray-600 mb-1">
                    <span v-html="highlightText(result.subtitle, searchQuery)"></span>
                  </p>
                  <p v-if="result.description" class="text-xs text-gray-500 line-clamp-2">
                    <span v-html="highlightText(result.description, searchQuery)"></span>
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <UiIcon :path="mdiChevronRight" class="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="searchQuery && !loading" class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <UiIcon :path="mdiMagnify" class="w-8 h-8 mx-auto" />
        </div>
        <p class="text-gray-600">No results found for "{{ searchQuery }}"</p>
        <p class="text-sm text-gray-500 mt-1">Try different keywords or check your spelling</p>
      </div>

      <!-- Initial State -->
      <div v-else class="text-center py-8">
        <div class="text-gray-400 mb-2">
          <UiIcon :path="mdiMagnify" class="w-8 h-8 mx-auto" />
        </div>
        <p class="text-gray-600">Search across all your accessible content</p>
        <p class="text-sm text-gray-500 mt-1">Type to start searching...</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>Press Esc to close</span>
        <span v-if="results.length > 0">{{ results.length }} results</span>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiMagnify,
  mdiClose,
  mdiAlertCircle,
  mdiChevronRight,
  mdiFileDocument,
  mdiAccount,
  mdiFormSelect,
  mdiHistory,
} from '@mdi/js'
import { UiModal, UiIcon } from '@/common/components'
import { useSearchStore, type SearchResult } from '@/common/store/search'

const router = useRouter()
const searchStore = useSearchStore()
const searchInput = ref<HTMLInputElement>()

const isOpen = computed({
  get: () => searchStore.isOpen,
  set: (value) => {
    if (!value) searchStore.closeSearch()
  },
})

const searchQuery = computed({
  get: () => searchStore.query,
  set: (value) => searchStore.setQuery(value),
})

const loading = computed(() => searchStore.loading)
const error = computed(() => searchStore.error)
const results = computed(() => searchStore.results)

// Group results by type
const groupedResults = computed(() => {
  const groups: Record<string, SearchResult[]> = {}

  results.value.forEach((result) => {
    if (!groups[result.type]) {
      groups[result.type] = []
    }
    groups[result.type].push(result)
  })

  return groups
})

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null

function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    searchStore.search(searchQuery.value)
  }, 300)
}

function handleEnter() {
  if (results.value.length > 0) {
    navigateToResult(results.value[0])
  }
}

function clearSearch() {
  searchStore.clearSearch()
  searchInput.value?.focus()
}

function closeSearch() {
  searchStore.closeSearch()
}

function navigateToResult(result: SearchResult) {
  closeSearch()
  router.push(result.url)
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    application: 'Applications',
    user: 'Users',
    form: 'Form Templates',
    audit: 'Audit Logs',
  }
  return labels[type] || type
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    application: mdiFileDocument,
    user: mdiAccount,
    form: mdiFormSelect,
    audit: mdiHistory,
  }
  return icons[type] || mdiFileDocument
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// Focus search input when modal opens
watch(isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
