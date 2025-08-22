import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/app/axios'
import type { Application } from '@uniapply/shared'
import type { UserPermissions } from '@/common/utils/permissions'

type Stat = {
  label: string
  value: number
  icon?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  trend?: number
}

interface DashboardData {
  // User-specific stats (for users without readAll)
  userStats: Stat[]
  // Admin stats (for users with readAll)
  adminStats: Stat[]
  // Recent applications
  recentApplications: Application[]
  // Pending approvals
  pendingApprovals: Application[]
  // Audit logs
  auditLogs: any[]
  // Active users count
  activeUsersCount: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<DashboardData>({
    userStats: [],
    adminStats: [],
    recentApplications: [],
    pendingApprovals: [],
    auditLogs: [],
    activeUsersCount: 0,
  })

  const hasData = computed(
    () =>
      data.value.recentApplications.length +
        data.value.pendingApprovals.length +
        data.value.auditLogs.length >
      0,
  )

  function clear() {
    data.value = {
      userStats: [],
      adminStats: [],
      recentApplications: [],
      pendingApprovals: [],
      auditLogs: [],
      activeUsersCount: 0,
    }
    error.value = null
  }

  async function load(userId?: string, permissions?: UserPermissions) {
    if (!userId || !permissions) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // Load applications data
      const [draftRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get<Application[]>('/applications', { params: { status: 'DRAFT' } }),
        api.get<Application[]>('/applications', { params: { status: 'PENDING_APPROVAL' } }),
        api.get<Application[]>('/applications', { params: { status: 'APPROVED' } }),
        api.get<Application[]>('/applications', { params: { status: 'REJECTED' } }),
      ])

      const draft = draftRes.data
      const pending = pendingRes.data
      const approved = approvedRes.data
      const rejected = rejectedRes.data

      const all = [...draft, ...pending, ...approved, ...rejected].sort((a, b) =>
        (b.updatedAt || '').localeCompare(a.updatedAt || ''),
      )

      if (permissions.applications.readAll) {
        // Admin view - show all data
        data.value.userStats = []
        data.value.adminStats = [
          {
            label: 'Approved This Month',
            value: approved.length,
            icon: 'mdiCheckCircleOutline',
            variant: 'success',
          },
          {
            label: 'Rejected This Month',
            value: rejected.length,
            icon: 'mdiCloseCircleOutline',
            variant: 'danger',
          },
        ]
        data.value.recentApplications = all.slice(0, 5)
        data.value.pendingApprovals = pending.slice(0, 5)
      } else {
        // User view - show only user's data
        const userDraft = draft.filter((a) => a.userId === userId)
        const userAll = all.filter((a) => a.userId === userId)
        const userPending = pending.filter((a) => a.userId === userId)
        const userApproved = approved.filter((a) => a.userId === userId)
        const userRejected = rejected.filter((a) => a.userId === userId)

        data.value.userStats = [
          {
            label: 'My Drafts',
            value: userDraft.length,
            icon: 'mdiFileDocumentOutline',
            variant: 'primary',
          },
          {
            label: 'Pending',
            value: userPending.length,
            icon: 'mdiClockOutline',
            variant: 'warning',
          },
          {
            label: 'Approved',
            value: userApproved.length,
            icon: 'mdiCheckCircleOutline',
            variant: 'success',
          },
          {
            label: 'Rejected',
            value: userRejected.length,
            icon: 'mdiCloseCircleOutline',
            variant: 'danger',
          },
        ]
        data.value.adminStats = []
        data.value.recentApplications = userAll.slice(0, 5)
        data.value.pendingApprovals = userPending.slice(0, 5)
      }

      // Load additional data based on permissions
      const additionalPromises: Promise<any>[] = []

      // Load audit logs if user has permission
      if (permissions.auditLogs.read) {
        additionalPromises.push(
          api
            .get('/audit-logs', { params: { limit: 5 } })
            .then((res) => res.data.items || [])
            .catch(() => []),
        )
      }

      // Load active users count if user has permission
      if (permissions.users.readAll) {
        additionalPromises.push(
          api
            .get('/users')
            .then((res) => res.data.filter((user: any) => user.active).length)
            .catch(() => 0),
        )
      }

      // Wait for additional data
      if (additionalPromises.length > 0) {
        const results = await Promise.all(additionalPromises)
        let resultIndex = 0

        if (permissions.auditLogs.read) {
          data.value.auditLogs = results[resultIndex] || []
          resultIndex++
        }
        if (permissions.users.readAll) {
          data.value.activeUsersCount = results[resultIndex] || 0
          resultIndex++
        }
      }
    } catch (e: any) {
      error.value = e?.message || 'Failed to load dashboard'
      console.error('Dashboard load error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    hasData,
    load,
    clear,
  }
})
