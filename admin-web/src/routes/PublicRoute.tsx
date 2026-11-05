import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  if (user) return <Navigate to={from} replace />
  return <>{children}</>
}
