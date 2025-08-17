<template>
  <nav class="flex h-full flex-col border-r bg-white">
    <div class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Menu</div>
    <ul class="flex-1 space-y-1 px-2">
      <li v-for="item in items" :key="item.label">
        <button
          @click="go(item.to)"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
          :class="
            route.name === item.to.name
              ? 'bg-primary/10 text-primary'
              : 'text-gray-700 hover:bg-gray-100'
          "
        >
          <UiIcon :path="item.icon" class="shrink-0" />
          <span class="truncate">{{ item.label }}</span>
        </button>
      </li>
    </ul>
    <div class="border-t px-4 py-3 text-xs text-gray-500">
      © {{ new Date().getFullYear() }} UniApply
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import UiIcon from '@/common/components/UiIcon.vue'
import { mdiViewDashboard, mdiFileDocumentEdit, mdiFileDocument, mdiAccountGroup } from '@mdi/js'

const route = useRoute()
const router = useRouter()

const items = [
  { to: { name: 'dashboard.home' }, label: 'Dashboard', icon: mdiViewDashboard },
  { to: { name: 'applications.list' }, label: 'Applications', icon: mdiFileDocument },
  { to: { name: 'forms.list' }, label: 'Form Templates', icon: mdiFileDocumentEdit },
  { to: { name: 'users.list' }, label: 'Users', icon: mdiAccountGroup },
]

const emit = defineEmits<{ (e: 'navigate'): void }>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function go(to: any) {
  router.push(to)
  emit('navigate')
}
</script>
