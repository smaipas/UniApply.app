import type { Router } from 'vue-router'
import { useAuthStore } from '@/auth/store'

export function installGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore()

    // If user is authenticated and trying to access the base URL, redirect to dashboard
    if (auth.isAuthenticated && to.path === '/') {
      return { path: '/dashboard' }
    }

    // If route requires auth but user is not authenticated, redirect to login
    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
      // Store the current path for redirect after login
      auth.rememberRedirect(to.fullPath)
      return { path: '/login' }
    }

    return true
  })
}
