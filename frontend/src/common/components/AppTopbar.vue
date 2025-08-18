<template>
  <header class="sticky top-0 z-40 bg-white border-b border-slate-200">
    <div class="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
      <div class="flex items-center gap-3">
        <button
          v-if="showMenuButton"
          class="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          @click="emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <UiIcon :path="mdiMenu" />
        </button>

        <UiInput type="search" placeholder="Search…" :icon="mdiMagnify" />
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions" />
        <slot name="user" />
        <UiButton :icon="mdiLogout" flat @click="onLogout" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { mdiMenu, mdiLogout, mdiMagnify } from '@mdi/js'
import UiButton from '@/common/components/UiButton.vue'
import UiIcon from '@/common/components/UiIcon.vue'
import { useAuthStore } from '@/auth/store'
import { useRouter } from 'vue-router'
import UiInput from '@/common/components/UiInput.vue'

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
