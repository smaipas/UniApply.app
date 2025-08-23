import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePermissions } from '@/common/utils/permissions'
import api from '@/app/axios'

export interface SearchResult {
  id: string
  type: 'application' | 'user' | 'form' | 'audit'
  title: string
  subtitle?: string
  description?: string
  url: string
  metadata?: Record<string, any>
}

export interface SearchState {
  query: string
  results: SearchResult[]
  loading: boolean
  error: string | null
  isOpen: boolean
}

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isOpen = ref(false)

  const { getUserPermissions } = usePermissions()

  const hasSearchableContent = computed(() => {
    const permissions = getUserPermissions()
    // Users should always be able to search their own applications
    return (
      permissions.applications.readAll ||
      permissions.applications.readOwn ||
      permissions.users.readAll ||
      permissions.formTemplates.readAll ||
      permissions.auditLogs.read ||
      true // Always allow search - backend will handle filtering
    )
  })

  async function search(searchQuery: string) {
    console.log('Frontend search debug:', {
      query: searchQuery,
      hasSearchableContent: hasSearchableContent.value,
      permissions: getUserPermissions(),
    })

    if (!searchQuery.trim() || !hasSearchableContent.value) {
      console.log('Search aborted - no query or no searchable content')
      results.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/search', {
        params: { q: searchQuery.trim() },
      })

      results.value = response.data.results || []
    } catch (err: any) {
      console.error('Search failed:', err)
      error.value = err.response?.data?.message || 'Search failed'
      results.value = []
    } finally {
      loading.value = false
    }
  }

  function clearSearch() {
    query.value = ''
    results.value = []
    error.value = null
  }

  function openSearch() {
    isOpen.value = true
  }

  function closeSearch() {
    isOpen.value = false
    clearSearch()
  }

  function setQuery(newQuery: string) {
    query.value = newQuery
  }

  return {
    // State
    query,
    results,
    loading,
    error,
    isOpen,

    // Computed
    hasSearchableContent,

    // Actions
    search,
    clearSearch,
    openSearch,
    closeSearch,
    setQuery,
  }
})
