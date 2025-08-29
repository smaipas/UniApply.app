<template>
  <div class="space-y-6">
    <!-- Profile Completion Warning -->
    <div
      v-if="!profileStatus.isComplete"
      class="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xs p-6"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-yellow-800">Complete Your Profile</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>{{ profileCompletionMessage }}</p>
            <div class="mt-4">
              <UiButton size="sm" @click="goToProfile" class="bg-yellow-600 hover:bg-yellow-700">
                Complete Profile
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="store.loading || appStore.isLoadingInitialData"
      class="flex items-center justify-center py-16"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-6"
        ></div>
        <p class="text-gray-600 text-lg">Loading your dashboard...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="store.error" class="flex items-center justify-center py-16">
      <div class="text-center max-w-md">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p class="text-gray-600 mb-6">{{ store.error }}</p>
        <UiButton @click="loadDashboardData" size="lg">Try Again</UiButton>
      </div>
    </div>

    <!-- Dashboard content -->
    <div v-else class="space-y-8">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-sky-900 to-cyan-700 rounded-xs p-8 text-white">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 class="text-3xl font-bold mb-2">
              Welcome back, {{ authStore.profile?.firstName || 'User' }}!
            </h1>
            <p class="text-blue-100 text-lg">
              Here's what's happening with your applications today.
            </p>
          </div>
          <div class="flex items-center gap-4">
            <UiButton
              v-if="!permissions.applications.readAll"
              @click="showTemplateSelector = true"
              variant="outline"
              size="lg"
              class="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
            >
              <UiIcon :path="mdiPlus" class="mr-2" />
              New Application
            </UiButton>
            <div class="hidden lg:block">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="statsToShow.length > 0">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
        <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
          <DashboardStatCard
            v-for="stat in statsToShow"
            :key="`stat-${stat.label}-${stat.value}`"
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :variant="stat.variant"
            :trend="stat.trend"
          />
        </div>
      </div>

      <!-- Applications Widgets Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Recent Applications Widget -->
        <div v-if="showRecentApplications" class="lg:col-span-2">
          <DashboardApplicationsWidget
            :key="`recent-${store.data.recentApplications.length}-${store.loading}`"
            title="Recent Applications"
            :items="store.data.recentApplications"
            :loading="store.loading"
            view-all-link="/applications"
            empty-message="No applications yet"
          />
        </div>

        <!-- Pending Approvals Widget -->
        <div v-if="showPendingApprovals" class="lg:col-span-1">
          <DashboardApplicationsWidget
            :key="`pending-${store.data.pendingApprovals.length}-${store.loading}`"
            title="Pending Approval"
            :items="store.data.pendingApprovals"
            :loading="store.loading"
            view-all-link="/applications"
            empty-message="No pending approvals"
          />
        </div>
      </div>

      <!-- Audit Logs Widget - Full Width -->
      <div v-if="showAuditLogs" class="w-full">
        <DashboardAuditLogsWidget
          :key="`audit-${store.data.auditLogs.length}-${store.loading}`"
          :items="store.data.auditLogs"
          :loading="store.loading"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!hasAnyWidgets" class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No data available</h3>
        <p class="text-gray-600">
          Your dashboard will populate once you have applications or permissions to view data.
        </p>
      </div>
    </div>

    <!-- Form Template Selector Modal -->
    <FormTemplateSelector v-model="showTemplateSelector" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/dashboard/store'
import { useAuthStore } from '@/auth/store'
import { usePermissions } from '@/common/utils/permissions'
import { UiButton, UiIcon } from '@/common/components'
import FormTemplateSelector from '@/form-templates/components/FormTemplateSelector.vue'
import { checkProfileCompletion, getProfileCompletionMessage } from '@/common/utils/profile'
import DashboardStatCard from '@/dashboard/components/DashboardStatCard.vue'
import DashboardApplicationsWidget from '@/dashboard/components/DashboardApplicationsWidget.vue'
import DashboardAuditLogsWidget from '@/dashboard/components/DashboardAuditLogsWidget.vue'
import { mdiPlus } from '@mdi/js'
import { useAppStore } from '@/common/store/app'

const router = useRouter()
const authStore = useAuthStore()
const store = useDashboardStore()
const { getUserPermissions } = usePermissions()
const appStore = useAppStore()

const showTemplateSelector = ref(false)

const profileStatus = computed(() => checkProfileCompletion(authStore.profile))
const profileCompletionMessage = computed(() => getProfileCompletionMessage(profileStatus.value))

const permissions = computed(() => getUserPermissions())

const statsToShow = computed(() => {
  const { applications, users } = permissions.value

  if (applications.readAll) {
    // Admin view - show admin stats + active users if available
    const stats = [...store.data.adminStats]

    // Add active users card if user has permission and there are active users
    if (users.readAll) {
      stats.push({
        label: 'Active Users',
        value: store.data.activeUsersCount,
        icon: 'mdiAccountGroupOutline',
        variant: 'info',
      })
    }

    return stats
  } else {
    // User view - show user stats
    return store.data.userStats
  }
})

const showRecentApplications = computed(() => {
  // Show for admins (always) or for users with data/loading
  if (permissions.value.applications.readAll) {
    return true // Admins always see this widget
  }
  const shouldShow = store.data.recentApplications.length > 0 || store.loading

  return shouldShow
})

const showPendingApprovals = computed(() => {
  // Show for admins (always) or for users with data/loading
  if (permissions.value.applications.readAll) {
    return true // Admins always see this widget
  }
  const shouldShow = store.data.pendingApprovals.length > 0 || store.loading

  return shouldShow
})

const showAuditLogs = computed(() => {
  const shouldShow =
    permissions.value.auditLogs.read && (store.data.auditLogs.length > 0 || store.loading)

  return shouldShow
})

const hasAnyWidgets = computed(() => {
  const hasWidgets =
    statsToShow.value.length > 0 ||
    showRecentApplications.value ||
    showPendingApprovals.value ||
    showAuditLogs.value

  return hasWidgets
})

function goToProfile() {
  router.push('/profile')
}

async function loadDashboardData() {
  store.load()
}

onMounted(() => {
  loadDashboardData()
})
</script>
