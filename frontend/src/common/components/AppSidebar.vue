<template>
  <nav class="flex h-full flex-col bg-slate-900 text-white">
    <!-- Top: Logo / Title -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
      <UiLogo :size="40" />
      <span class="truncate text-sm font-semibold text-white/90">{{ pageTitle }}</span>
    </div>

    <!-- Scrollable nav -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
        Menu
      </div>

      <ul class="space-y-1 px-3 pb-4">
        <li v-for="item in items" :key="item.label">
          <button
            @click="go(item.to)"
            class="group flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm transition"
            :class="
              route.name === item.to.name
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            "
          >
            <UiIcon :path="item.icon" class="shrink-0 opacity-90 group-hover:opacity-100" />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </li>
      </ul>

      <!-- System Section -->
      <div class="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
        System
      </div>

      <ul class="space-y-1 px-3 pb-4">
        <li v-for="item in systemItems" :key="item.label">
          <button
            @click="go(item.to)"
            class="group flex w-full items-center cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm transition"
            :class="
              route.name === item.to.name
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            "
          >
            <UiIcon :path="item.icon" class="shrink-0 opacity-90 group-hover:opacity-100" />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="px-5 py-4 text-[11px] text-white/60 border-t border-white/10">
      © {{ new Date().getFullYear() }} UniApply
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiIcon, UiLogo } from '@/common/components'
import {
  mdiViewDashboard,
  mdiFileDocumentEdit,
  mdiFileDocument,
  mdiAccountGroup,
  mdiAccountMultiple,
  mdiClipboardList,
  mdiAccount,
} from '@mdi/js'

const route = useRoute()
const router = useRouter()

const items = [
  { to: { name: 'Dashboard' }, label: 'Dashboard', icon: mdiViewDashboard },
  { to: { name: 'ApplicationsPage' }, label: 'Applications', icon: mdiFileDocument },
  { to: { name: 'FormTemplatesPage' }, label: 'Form Templates', icon: mdiFileDocumentEdit },
  { to: { name: 'profile' }, label: 'My Profile', icon: mdiAccount },
  { to: { name: 'UsersPage' }, label: 'Users', icon: mdiAccountGroup },
]

const systemItems = [
  { to: { name: 'user-groups' }, label: 'User Groups', icon: mdiAccountMultiple },
  { to: { name: 'logs' }, label: 'Logs', icon: mdiClipboardList },
]

const emit = defineEmits<{ (e: 'navigate'): void }>()

const pageTitle = computed(() => (route.meta?.title as string) || 'UniApply')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function go(to: any) {
  router.push(to)
  emit('navigate')
}
</script>
