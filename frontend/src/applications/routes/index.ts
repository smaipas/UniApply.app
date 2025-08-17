import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/applications',
    name: 'ApplicationsPage',
    component: () => import('@/applications/pages/ApplicationsPage.vue'),
    meta: { requiresAuth: true },
  },
] as RouteRecordRaw[]
