import axios, { type AxiosError, type AxiosRequestHeaders, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/auth/store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000,
})

// Attach JWT
api.interceptors.request.use((config) => {
  const { tokens } = useAuthStore()
  const idToken = tokens?.idToken || null
  if (idToken) {
    config.headers = config.headers || {}
    ;(config.headers as AxiosRequestHeaders).Authorization = `Bearer ${idToken}`
  }
  return config
})

// 401 -> try silent refresh -> retry once
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const auth = useAuthStore()
    const original = error.config as AxiosRequestConfig
    const is401 = error.response?.status === 401
    if (is401 && !original?._retried) {
      original._retried = true
      try {
        await auth.tryRefresh()
        // header will be set by request interceptor from the new store token
        return api(original)
      } catch {
        // refresh failed -> fall through
      }
    }
    return Promise.reject(error)
  },
)

export default api
