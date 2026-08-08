import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/auth.store"
import Loading from "@/shared/components/ui/Loading"

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return <Loading fullScreen text="Verifying session..." />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
