<template>
  <div class="flex h-screen overflow-hidden">
    <aside
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      class="absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear lg:static lg:translate-x-0"
    >
      <AppSidebar @navigate="sidebarOpen = false" />
    </aside>
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main>
        <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Loading overlay for initial data loading -->
    <UiLoadingOverlay
      :show="isLoadingInitialData"
      message="Loading your profile and permissions..."
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'

import { AppTopbar, AppSidebar } from '@/common/components'
import { UiLoadingOverlay } from '@/common/components'
import { useRolesStore } from '@/common/store/roles'
import { useAuthStore } from '@/auth/store'

const sidebarOpen = ref(false)
const isLoadingInitialData = ref(false)

const rolesStore = useRolesStore()
const authStore = useAuthStore()

// Check if we need to load initial data
const needsInitialData = computed(() => {
  return (
    authStore.isAuthenticated &&
    (!authStore.profile || !rolesStore.loaded) &&
    !isLoadingInitialData.value
  )
})

// Load user profile and roles data
async function loadInitialData() {
  if (!needsInitialData.value) return

  isLoadingInitialData.value = true

  try {
    // Load both profile and roles in parallel
    await Promise.all([authStore.loadProfile(), rolesStore.ensureLoaded()])
  } catch (error) {
    console.error('Failed to load initial data:', error)
  } finally {
    isLoadingInitialData.value = false
  }
}

onMounted(() => {
  loadInitialData()
})

// Watch for authentication changes and load data when user becomes authenticated
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      loadInitialData()
    }
  },
)
</script>
