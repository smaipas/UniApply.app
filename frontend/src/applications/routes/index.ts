import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/applications',
    name: 'ApplicationsPage',
    component: () => import('@/applications/pages/ApplicationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/applications/new',
    name: 'NewApplicationPage',
    component: () => import('@/applications/pages/ApplicationFormPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/applications/:id/edit',
    name: 'EditApplicationPage',
    component: () => import('@/applications/pages/ApplicationFormPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/applications/:id',
    name: 'applications.view',
    component: () => import('@/applications/pages/ApplicationFormPage.vue'),
    meta: { requiresAuth: true },
  },
] as RouteRecordRaw[]
