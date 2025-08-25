<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Overlay for mobile sidebar -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-[45] bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <aside
      ref="sidebarRef"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      class="absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear lg:static lg:translate-x-0"
    >
      <AppSidebar @navigate="sidebarOpen = false" />
    </aside>
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main>
        <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <router-view v-if="!appStore.isLoadingInitialData" />
        </div>
      </main>
    </div>

    <!-- Loading overlay for initial data loading -->
    <UiLoadingOverlay
      :show="appStore.isLoadingInitialData"
      message="Loading your profile and permissions..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

import { AppTopbar, AppSidebar } from '@/common/components'
import { UiLoadingOverlay } from '@/common/components'
import { useAppStore } from '@/common/store/app'
import { useAuthStore } from '@/auth/store'

const appStore = useAppStore()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const sidebarRef = ref<HTMLElement>()

// Handle click outside sidebar on mobile
onClickOutside(sidebarRef, () => {
  if (sidebarOpen.value && window.innerWidth < 1024) {
    // lg breakpoint
    sidebarOpen.value = false
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      appStore.loadInitialData()
    }
  },
  { immediate: true },
)
</script>
