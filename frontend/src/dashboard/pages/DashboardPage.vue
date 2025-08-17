<template>
  <div class="space-y-6">
    <!-- Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStat v-for="s in store.stats" :key="s.label" :label="s.label" :value="s.value" />
    </div>

    <!-- Two columns -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <DashboardRecentApps :items="store.recentApps" />
      </div>
      <div class="lg:col-span-1">
        <DashboardApprovals :items="store.pendingApprovals" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '@/dashboard/store'
import DashboardStat from '@/dashboard/components/DashboardStat.vue'
import DashboardRecentApps from '@/dashboard/components/DashboardRecentApps.vue'
import DashboardApprovals from '@/dashboard/components/DashboardApprovals.vue'

const currentUserId: string | undefined = undefined

const store = useDashboardStore()
onMounted(() => store.load(currentUserId))
</script>
