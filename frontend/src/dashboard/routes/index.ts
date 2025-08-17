import type { RouteRecordRaw } from 'vue-router'

const DashboardPage = () => import('@/dashboard/pages/DashboardPage.vue')

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
]

export default dashboardRoutes
