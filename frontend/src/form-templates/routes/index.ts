import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/form-templates',
    name: 'FormTemplatesPage',
    component: () => import('@/form-templates/pages/FormTemplatesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/form-templates/new',
    name: 'FormTemplateCreatePage',
    component: () => import('@/form-templates/pages/FormTemplateEditorPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/form-templates/:id',
    name: 'FormTemplateEditPage',
    component: () => import('@/form-templates/pages/FormTemplateEditorPage.vue'),
    meta: { requiresAuth: true },
  },
] as RouteRecordRaw[]
