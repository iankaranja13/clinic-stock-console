import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'checking') {
    return <div className="flex h-screen items-center justify-center">Loading…</div>
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
