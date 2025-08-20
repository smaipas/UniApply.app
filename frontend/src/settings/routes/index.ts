import type { RouteRecordRaw } from 'vue-router'
import UserGroupsPage from '../pages/UserGroupsPage.vue'
import LogsPage from '../pages/LogsPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/user-groups',
    name: 'user-groups',
    component: UserGroupsPage,
    meta: { requiresAuth: true, title: 'User Groups' },
  },
  {
    path: '/logs',
    name: 'logs',
    component: LogsPage,
    meta: { requiresAuth: true, title: 'Audit Logs' },
  },
]

export default routes
