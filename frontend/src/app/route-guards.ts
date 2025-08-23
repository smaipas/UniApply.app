import type { Router } from 'vue-router'
import { useAuthStore } from '@/auth/store'

export function installGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
      // Store the current path for redirect after login
      auth.rememberRedirect(to.fullPath)
      return { path: '/login' }
    }
    return true
  })
}
