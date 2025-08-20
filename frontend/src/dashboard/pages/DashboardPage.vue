<template>
  <div class="space-y-6">
    <!-- Profile Completion Warning -->
    <div
      v-if="!profileStatus.isComplete"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>{{ profileCompletionMessage }}</p>
            <div class="mt-3">
              <UiButton size="sm" @click="goToProfile">Complete Profile</UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/dashboard/store'
import { useAuthStore } from '@/auth/store'
import { UiButton } from '@/common/components'
import { checkProfileCompletion, getProfileCompletionMessage } from '@/common/utils/profile'
import DashboardStat from '@/dashboard/components/DashboardStat.vue'
import DashboardRecentApps from '@/dashboard/components/DashboardRecentApps.vue'
import DashboardApprovals from '@/dashboard/components/DashboardApprovals.vue'

const router = useRouter()
const authStore = useAuthStore()
const store = useDashboardStore()

const profileStatus = computed(() => checkProfileCompletion(authStore.profile))
const profileCompletionMessage = computed(() => getProfileCompletionMessage(profileStatus.value))

function goToProfile() {
  router.push('/profile')
}

onMounted(() => store.load(authStore.user?.sub))
</script>
