import type { RouteRecordRaw } from 'vue-router'

const LoginPage = () => import('@/auth/pages/LoginPage.vue')
const SignUpPage = () => import('@/auth/pages/SignUpPage.vue')
const ForgotPasswordPage = () => import('@/auth/pages/ForgotPasswordPage.vue')
const ResetPasswordPage = () => import('@/auth/pages/ResetPasswordPage.vue')
const ConfirmRegistrationPage = () => import('@/auth/pages/ConfirmRegistrationPage.vue')
const authRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: LoginPage, meta: { requiresAuth: false } },
  { path: '/signup', name: 'signup', component: SignUpPage, meta: { requiresAuth: false } },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/confirm-registration',
    name: 'confirm-registration',
    component: ConfirmRegistrationPage,
    meta: { requiresAuth: false },
  },
]

export default authRoutes
