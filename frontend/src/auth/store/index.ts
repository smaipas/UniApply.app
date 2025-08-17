import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import {
  signIn,
  signUp,
  confirmSignUp,
  forgotPassword,
  confirmForgotPassword,
  refreshTokens,
} from '@/auth/services/cognito'

type AuthTokens = {
  accessToken: string
  idToken: string
  refreshToken?: string | null
}

type JwtClaims = {
  sub: string
  email?: string
  exp?: number // epoch seconds
  'cognito:groups'?: string[]
  'custom:roles'?: string[]
}

type User = { sub: string; email: string; roles: string[] }

const STORAGE_KEY = 'uniapply.auth'

function persist(tokens: AuthTokens | null) {
  if (tokens) localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  else localStorage.removeItem(STORAGE_KEY)
}
function restore(): AuthTokens | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}
function decodeUser(idToken: string): User {
  const claims = jwtDecode<JwtClaims>(idToken)
  const roles = claims['custom:roles'] || claims['cognito:groups'] || []
  return { sub: claims.sub, email: claims.email || '', roles }
}

export const useAuthStore = defineStore('auth', () => {
  const tokens = ref<AuthTokens | null>(restore())
  const user = ref<User | null>(tokens.value ? decodeUser(tokens.value.idToken) : null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const redirectAfterLogin = ref<string | null>(null)

  const isAuthenticated = computed(() => !!tokens.value?.idToken)
  const roles = computed(() => user.value?.roles ?? [])

  // refresh scheduling
  let refreshTimer: number | undefined

  function clearRefreshTimer() {
    if (refreshTimer !== undefined) {
      window.clearTimeout(refreshTimer)
      refreshTimer = undefined
    }
  }

  function scheduleRefreshFrom(idToken: string, refreshToken?: string | null) {
    if (!idToken || !refreshToken) return
    try {
      const { exp } = jwtDecode<JwtClaims>(idToken) || {}
      if (!exp) return
      const expiresAt = exp * 1000
      const now = Date.now()
      const lead = 60_000 // refresh 60s before expiry
      const delay = Math.max(5_000, expiresAt - now - lead)
      clearRefreshTimer()
      refreshTimer = window.setTimeout(() => {
        tryRefresh()
      }, delay)
    } catch {
      // no-op
    }
  }

  function setTokens(newTokens: AuthTokens) {
    tokens.value = newTokens
    user.value = decodeUser(newTokens.idToken)
    persist(tokens.value)
    scheduleRefreshFrom(newTokens.idToken, newTokens.refreshToken)
  }

  function rememberRedirect(path: string) {
    redirectAfterLogin.value = path
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await signIn(email, password)
      const r = res.AuthenticationResult
      if (!r?.IdToken || !r?.AccessToken) throw new Error('Authentication failed: missing tokens')
      setTokens({
        idToken: r.IdToken,
        accessToken: r.AccessToken,
        refreshToken: r.RefreshToken ?? tokens.value?.refreshToken ?? null,
      })
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e
      throw new Error(err?.message || 'Login failed')
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, givenName: string, familyName: string) {
    loading.value = true
    error.value = null
    try {
      await signUp({ email, password, givenName, familyName })
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e
      throw new Error(err?.message || 'Registration failed')
    } finally {
      loading.value = false
    }
  }

  async function confirmRegistration(email: string, code: string) {
    loading.value = true
    error.value = null
    try {
      await confirmSignUp(email, code)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e
      throw new Error(err?.message || 'Confirmation failed')
    } finally {
      loading.value = false
    }
  }

  async function requestPasswordReset(email: string) {
    loading.value = true
    error.value = null
    try {
      await forgotPassword(email)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e
      throw new Error(err?.message || 'Password reset request failed')
    } finally {
      loading.value = false
    }
  }

  async function confirmPasswordReset(email: string, code: string, newPassword: string) {
    loading.value = true
    error.value = null
    try {
      await confirmForgotPassword(email, code, newPassword)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e
      throw new Error(err?.message || 'Password reset confirmation failed')
    } finally {
      loading.value = false
    }
  }

  async function tryRefresh() {
    if (!tokens.value?.refreshToken) {
      logout() // No refresh token, so log out
      throw new Error('No refresh token available.')
    }
    try {
      const res = await refreshTokens(tokens.value.refreshToken)
      const r = res.AuthenticationResult
      if (!r?.IdToken || !r?.AccessToken) {
        logout() // Tokens missing from refresh response, log out
        throw new Error('Missing tokens from refresh response.')
      }
      setTokens({
        idToken: r.IdToken,
        accessToken: r.AccessToken,
        // refresh token usually unchanged for REFRESH_TOKEN_AUTH
        refreshToken: tokens.value.refreshToken,
      })
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e
      console.warn('Silent refresh failed:', err?.message || e)
      logout() // Refresh failed, log out
      throw e // Re-throw the error to be caught by the interceptor
    }
  }

  function logout() {
    user.value = null
    tokens.value = null
    clearRefreshTimer()
    persist(null)
  }

  // When app loads with saved tokens, schedule a refresh immediately.
  if (tokens.value?.idToken) {
    scheduleRefreshFrom(tokens.value.idToken, tokens.value.refreshToken)
  }

  // Refresh when tab becomes visible and token is near/after expiry.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // quick check: if exp < now+60s, refresh
        const id = tokens.value?.idToken
        const rt = tokens.value?.refreshToken
        if (!id || !rt) return
        try {
          const { exp } = jwtDecode<JwtClaims>(id) || {}
          if (!exp) return
          const msLeft = exp * 1000 - Date.now()
          if (msLeft < 60_000) tryRefresh()
        } catch {
          /* noop */
        }
      }
    })
  }

  return {
    // state
    tokens,
    user,
    loading,
    error,
    redirectAfterLogin,
    // getters
    isAuthenticated,
    roles,
    // actions
    rememberRedirect,
    login,
    register,
    confirmRegistration,
    requestPasswordReset,
    confirmPasswordReset,
    tryRefresh,
    logout,
  }
})
