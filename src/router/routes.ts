export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  CATALOGS: {
    SUPPLIERS: '/catalog/suppliers',
    CATEGORIES: '/catalog/categories',
    COLORS: '/catalog/colors',
    SIZES: '/catalog/sizes',
    GENDERS: '/catalog/genders',
  },
  PURCHASES: '/movements/purchase',
  SALES: '/movements/sale',
  REPORTS: '/reports',
  USERS: '/users',
} as const
