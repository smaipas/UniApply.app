import type { RouteRecordRaw } from 'vue-router'

const ProfilePage = () => import('@/auth/pages/ProfilePage.vue')

const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
]

export default profileRoutes
