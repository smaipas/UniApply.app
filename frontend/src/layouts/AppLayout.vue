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
import { ref, watch } from 'vue'

import { AppTopbar, AppSidebar } from '@/common/components'
import { UiLoadingOverlay } from '@/common/components'
import { useRolesStore } from '@/common/store/roles'
import { useAuthStore } from '@/auth/store'

const rolesStore = useRolesStore()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const isLoadingInitialData = ref(false)

async function loadInitialData() {
  isLoadingInitialData.value = true
  try {
    await Promise.all([authStore.loadProfile(), rolesStore.ensureLoaded()])
  } catch (error) {
    console.error('Failed to load initial data:', error)
  } finally {
    isLoadingInitialData.value = false
  }
}

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      loadInitialData()
    }
  },
  { immediate: true },
)
</script>
