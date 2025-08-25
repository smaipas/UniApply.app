import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/app/axios'
import type { RoleModel } from '@uniapply/shared'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<RoleModel[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const roleNames = computed(() => roles.value.map((r) => r.roleName))

  async function fetchRoles(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      const res = await api.get<Array<RoleModel | { roleName: string }>>('/roles')
      // backend may hide access for non-admins; keep shape consistent
      roles.value = (res.data || []).map((r: any) => ({
        roleName: r.roleName,
        roleLabel: (r as RoleModel).roleLabel || r.roleName,
        access: (r as RoleModel).access || ({} as any),
        createdAt: (r as RoleModel).createdAt || '',
        updatedAt: (r as RoleModel).updatedAt || '',
      }))
      loaded.value = true
    } catch (e: any) {
      error.value = e?.message || 'Failed to load roles'
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) {
      await fetchRoles()
    }
  }

  return { roles, roleNames, loaded, loading, error, fetchRoles, ensureLoaded }
})
