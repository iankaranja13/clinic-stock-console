import axios from 'axios'

const BASE_URL = 'https://dummyjson.com'

export const api = axios.create({ baseURL: BASE_URL })

// In-memory token storage. Access token is never persisted to disk;
// refresh token is mirrored to sessionStorage so a page reload doesn't
// force a full re-login, while still clearing when the tab closes.
let accessToken: string | null = null
let refreshToken: string | null = sessionStorage.getItem('refreshToken')

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  sessionStorage.setItem('refreshToken', refresh)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  sessionStorage.removeItem('refreshToken')
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return refreshToken
}

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Refresh-on-401 handling with a single in-flight refresh shared by
// any requests that fail concurrently, so we never fire multiple
// refresh calls at once.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) throw new Error('No refresh token available')

  const response = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
    expiresInMins: 1,
  })

  const newAccess = response.data.accessToken
  const newRefresh = response.data.refreshToken
  setTokens(newAccess, newRefresh)
  return newAccess
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // If a refresh is already in progress, reuse it instead of
        // starting a second one.
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newAccessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
