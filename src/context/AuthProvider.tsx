import { useEffect, useReducer, type ReactNode } from 'react'
import { api, setTokens, clearTokens, getRefreshToken } from '@/lib/api'
import { authReducer, initialAuthState, type User } from '@/lib/auth-types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  // On app startup, try to silently restore a session from the
  // refresh token in sessionStorage, so a page reload doesn't force
  // the user back to the login screen.
  useEffect(() => {
    async function restoreSession() {
      const existingRefreshToken = getRefreshToken()

      if (!existingRefreshToken) {
        dispatch({ type: 'SESSION_MISSING' })
        return
      }

      try {
        const refreshResponse = await api.post('/auth/refresh', {
          refreshToken: existingRefreshToken,
          expiresInMins: 1,
        })
        setTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken)

        const meResponse = await api.get<User>('/auth/me')
        dispatch({ type: 'SESSION_RESTORED', user: meResponse.data })
      } catch {
        clearTokens()
        dispatch({ type: 'SESSION_MISSING' })
      }
    }

    restoreSession()
  }, [])

  async function login(username: string, password: string) {
    const loginResponse = await api.post('/auth/login', {
      username,
      password,
      expiresInMins: 1,
    })
    setTokens(loginResponse.data.accessToken, loginResponse.data.refreshToken)

    const meResponse = await api.get<User>('/auth/me')
    dispatch({ type: 'LOGIN_SUCCESS', user: meResponse.data })
  }

  function logout() {
    clearTokens()
    dispatch({ type: 'LOGOUT' })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}
