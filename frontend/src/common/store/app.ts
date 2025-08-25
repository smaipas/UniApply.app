import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRolesStore } from './roles'
import { useAuthStore } from '@/auth/store'

export const useAppStore = defineStore('app', () => {
  const isLoadingInitialData = ref(false)
  const error = ref<string | null>(null)

  async function loadInitialData() {
    isLoadingInitialData.value = true
    error.value = null
    try {
      const rolesStore = useRolesStore()
      const authStore = useAuthStore()

      await Promise.all([authStore.loadProfile(), rolesStore.ensureLoaded()])
    } catch (err: any) {
      console.error('Failed to load initial data:', err)
      error.value = err?.message || 'Failed to load initial data'
    } finally {
      isLoadingInitialData.value = false
    }
  }

  return {
    isLoadingInitialData,
    error,
    loadInitialData,
  }
})
