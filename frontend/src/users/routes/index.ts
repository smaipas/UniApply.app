import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/users',
    name: 'UsersPage',
    component: () => import('@/users/pages/UsersPage.vue'),
    meta: { requiresAuth: true },
  },
] as RouteRecordRaw[]
