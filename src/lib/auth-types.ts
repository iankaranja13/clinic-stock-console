export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
}

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  status: AuthStatus
  user: User | null
}

export type AuthAction =
  | { type: 'SESSION_RESTORED'; user: User }
  | { type: 'SESSION_MISSING' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGOUT' }

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SESSION_RESTORED':
    case 'LOGIN_SUCCESS':
      return { status: 'authenticated', user: action.user }
    case 'SESSION_MISSING':
    case 'LOGOUT':
      return { status: 'unauthenticated', user: null }
    default:
      return state
  }
}

export const initialAuthState: AuthState = {
  status: 'checking',
  user: null,
}
