<template>
  <div class="flex h-screen overflow-hidden">
    <aside
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      class="absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear lg:static lg:translate-x-0"
    >
      <AppSidebar @navigate="sidebarOpen = false" />
    </aside>
    <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen">
        <template #actions>
          <UiButton variant="accent" size="sm" class="hidden sm:inline-flex">New</UiButton>
        </template>
        <template #user>
          <UiIcon :path="mdiAccount" class="text-gray-700" title="Account" />
        </template>
      </AppTopbar>
      <main>
        <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import AppTopbar from '@/common/components/AppTopbar.vue'
import AppSidebar from '@/common/components/AppSidebar.vue'
import UiButton from '@/common/components/UiButton.vue'
import UiIcon from '@/common/components/UiIcon.vue'
import { mdiAccount } from '@mdi/js'

const sidebarOpen = ref(false)

// The old toggleSidebar function is now inlined in the template: @toggle-sidebar="sidebarOpen = !sidebarOpen"
// The UiDrawer component is no longer needed.
</script>
