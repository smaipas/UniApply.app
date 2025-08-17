<template>
  <header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
      <button
        v-if="showMenuButton"
        class="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        @click="emit('toggle-sidebar')"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <UiIcon :path="mdiMenu" />
      </button>

      <div class="flex items-center gap-2">
        <slot name="logo">
          <div class="h-6 w-6 rounded bg-primary"></div>
        </slot>
        <span class="text-sm font-semibold text-gray-800">{{ title }}</span>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
        <input
          type="search"
          placeholder="Search…"
          class="hidden md:block w-64 rounded-md border px-3 py-1.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        <slot name="user" />
        <UiButton :icon="mdiLogout" variant="ghost" @click="onLogout" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { mdiMenu, mdiLogout } from '@mdi/js'
import UiButton from '@/common/components/UiButton.vue'
import UiIcon from '@/common/components/UiIcon.vue'
import { useAuthStore } from '@/auth/store'
import { useRouter } from 'vue-router'

withDefaults(defineProps<{ title?: string; showMenuButton?: boolean }>(), {
  showMenuButton: true,
})
const emit = defineEmits<{ (e: 'toggle-sidebar'): void }>()

const auth = useAuthStore()
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>