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
        <li v-for="item in visibleItems" :key="item.label">
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
      <div
        v-if="visibleSystemItems.length > 0"
        class="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/60"
      >
        System
      </div>

      <ul class="space-y-1 px-3 pb-4">
        <li v-for="item in visibleSystemItems" :key="item.label">
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
      © {{ new Date().getFullYear() }} {{ config.appName }}
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiIcon, UiLogo } from '@/common/components'
import { usePermissions } from '@/common/utils/permissions'
import { config } from '@/common/utils/config'
import {
  mdiViewDashboard,
  mdiFileDocumentEdit,
  mdiFileDocument,
  mdiAccountGroup,
  mdiAccountMultiple,
  mdiClipboardList,
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const { getUserPermissions } = usePermissions()

const allItems = [
  { to: { name: 'Dashboard' }, label: 'Dashboard', icon: mdiViewDashboard },
  { to: { name: 'ApplicationsPage' }, label: 'Applications', icon: mdiFileDocument },
  {
    to: { name: 'FormTemplatesPage' },
    label: 'Form Templates',
    icon: mdiFileDocumentEdit,
    permission: 'formTemplates.readAll',
  },
  { to: { name: 'UsersPage' }, label: 'Users', icon: mdiAccountGroup, permission: 'users.readAll' },
]

const allSystemItems = [
  {
    to: { name: 'user-groups' },
    label: 'User Groups',
    icon: mdiAccountMultiple,
    permission: 'roles.readAll',
  },
  { to: { name: 'logs' }, label: 'Logs', icon: mdiClipboardList, permission: 'auditLogs.read' },
]

// Filter items based on permissions
const visibleItems = computed(() => {
  const permissions = getUserPermissions()
  return allItems.filter((item) => {
    if (!item.permission) return true // No permission required

    const [resource, action] = item.permission.split('.')
    switch (resource) {
      case 'users':
        return permissions.users[action as keyof typeof permissions.users] || false
      case 'formTemplates':
        return permissions.formTemplates[action as keyof typeof permissions.formTemplates] || false
      case 'applications':
        return permissions.applications[action as keyof typeof permissions.applications] || false
      default:
        return false
    }
  })
})

const visibleSystemItems = computed(() => {
  const permissions = getUserPermissions()
  return allSystemItems.filter((item) => {
    if (!item.permission) return true // No permission required

    const [resource, action] = item.permission.split('.')
    switch (resource) {
      case 'roles':
        return permissions.roles[action as keyof typeof permissions.roles] || false
      case 'auditLogs':
        return permissions.auditLogs[action as keyof typeof permissions.auditLogs] || false
      default:
        return false
    }
  })
})

const emit = defineEmits<{ (e: 'navigate'): void }>()

const pageTitle = computed(() => (route.meta?.title as string) || config.appName)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function go(to: any) {
  router.push(to)
  emit('navigate')
}
</script>
