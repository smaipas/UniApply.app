<template>
  <AppTopbar :title="pageTitle" :showMenuButton="true" @toggle-sidebar="toggleSidebar">
    <template #logo>
      <div class="flex items-center gap-2">
        <UiLogo :size="24" />
      </div>
    </template>

    <template #actions>
      <UiButton variant="accent" size="sm" class="hidden sm:inline-flex">New</UiButton>
    </template>

    <template #user>
      <UiIcon :path="mdiAccount" class="text-gray-700" title="Account" />
    </template>
  </AppTopbar>

  <div class="mx-auto flex max-w-screen-2xl">
    <aside class="sticky top-14 hidden h-[calc(100vh-56px)] w-64 max-w-[16rem] shrink-0 md:block">
      <AppSidebar />
    </aside>

    <main class="flex-1 min-h-[calc(100vh-56px)] p-4 md:p-6">
      <router-view />
    </main>
  </div>

  <!-- Drawer for mobile only -->
  <UiDrawer v-model="open" side="left" width-class="w-72" class="md:hidden">
    <AppSidebar @navigate="open = false" />
  </UiDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import AppTopbar from '@/common/components/AppTopbar.vue'
import UiDrawer from '@/common/components/UiDrawer.vue'
import AppSidebar from '@/common/components/AppSidebar.vue'
import UiButton from '@/common/components/UiButton.vue'
import UiIcon from '@/common/components/UiIcon.vue'
import UiLogo from '@/common/components/UiLogo.vue'
import { mdiAccount } from '@mdi/js'

const open = ref(false)
const route = useRoute()
const pageTitle = computed(() => (route.meta?.title as string) || 'UniApply')
const toggleSidebar = () => (open.value = !open.value)
</script>
