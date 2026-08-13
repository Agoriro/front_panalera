import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import { ROUTES } from './routes'
import { useAuthStore } from '../stores/authStore'

// Import feature pages
import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import InventoryPage from '../features/inventory/InventoryPage'
import SuppliersPage from '../features/catalog/suppliers/SuppliersPage'
import CategoriesPage from '../features/catalog/categories/CategoriesPage'
import ColorsPage from '../features/catalog/colors/ColorsPage'
import SizesPage from '../features/catalog/sizes/SizesPage'
import GendersPage from '../features/catalog/genders/GendersPage'
import PurchasePage from '../features/movements/PurchasePage'
import SalePage from '../features/movements/SalePage'
import SalesReportPage from '../features/reports/SalesReportPage'
import UsersPage from '../features/users/UsersPage'

// Root redirect handler
const RootRedirect = () => {
  const { accessToken, role } = useAuthStore()

  if (!accessToken) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (role === 'Admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  } else {
    return <Navigate to={ROUTES.SALES} replace />
  }
}

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.INVENTORY,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CATALOGS.SUPPLIERS,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <SuppliersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CATALOGS.CATEGORIES,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <CategoriesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CATALOGS.COLORS,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <ColorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CATALOGS.SIZES,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <SizesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CATALOGS.GENDERS,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <GendersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PURCHASES,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <PurchasePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.SALES,
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Vendedor']}>
            <SalePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.REPORTS,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <SalesReportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.USERS,
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
