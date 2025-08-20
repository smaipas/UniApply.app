import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { installGuards } from './route-guards'

// Auth module routes
import authRoutes from '@/auth/routes'

// Feature module routes
import dashboardRoutes from '@/dashboard/routes'
import applicationsRoutes from '@/applications/routes'
import templatesRoutes from '@/form-templates/routes'
import usersRoutes from '@/users/routes'
import settingsRoutes from '@/settings/routes'
import profileRoutes from '@/profile/routes'
// import approvalsRoutes from '@/approvals/routes';
// import auditRoutes from '@/audit/routes';

import AppLayout from '@/layouts/AppLayout.vue'

const protectedChildren: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...applicationsRoutes,
  ...templatesRoutes,
  ...usersRoutes,
  ...settingsRoutes,
  ...profileRoutes,
  // ...approvalsRoutes,
  // ...auditRoutes,
]

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: protectedChildren,
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({ history: createWebHistory(), routes })
installGuards(router)
export default router
