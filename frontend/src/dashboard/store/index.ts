import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/app/axios'
import type { Application } from '@uniapply/shared'

type Stat = { label: string; value: number }

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const recentApps = ref<Application[]>([])
  const pendingApprovals = ref<Application[]>([])
  const stats = ref<Stat[]>([
    { label: 'My Drafts', value: 0 },
    { label: 'Pending', value: 0 },
    { label: 'Approved', value: 0 },
    { label: 'Rejected', value: 0 },
  ])

  const hasData = computed(() => recentApps.value.length + pendingApprovals.value.length > 0)

  async function load(userId?: string) {
    loading.value = true
    error.value = null
    try {
      // Ask backend by status to leverage GSIs (no scans)
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

      recentApps.value = (userId ? all.filter((a) => a.userId === userId) : all).slice(0, 8)
      pendingApprovals.value = pending.slice(0, 8)

      stats.value = [
        {
          label: 'My Drafts',
          value: userId ? draft.filter((a) => a.userId === userId).length : draft.length,
        },
        { label: 'Pending', value: pending.length },
        { label: 'Approved', value: approved.length },
        { label: 'Rejected', value: rejected.length },
      ]
    } catch (e: any) {
      error.value = e?.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, stats, recentApps, pendingApprovals, hasData, load }
})