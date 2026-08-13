import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'
import { ROUTES } from '../../router/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { accessToken, role } = useAuthStore()
  const location = useLocation()

  console.log('ProtectedRoute - Path:', location.pathname, 'User Role:', role, 'Allowed Roles:', allowedRoles)

  useEffect(() => {
    if (accessToken && allowedRoles && role && !allowedRoles.includes(role)) {
      toast.warning('No tienes permisos suficientes para acceder a esta sección.')
    }
  }, [accessToken, allowedRoles, role, location.pathname])

  if (!accessToken) {
    // Redirect to login if there is no token
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If user's role is not allowed, redirect to default landing for that role
    if (role === 'Admin') {
      return <Navigate to={ROUTES.DASHBOARD} replace />
    } else {
      return <Navigate to={ROUTES.SALES} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
