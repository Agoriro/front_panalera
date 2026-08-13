import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from './ThemeProvider'
import { Sun, Moon, LogOut, ChevronRight, User as UserIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'

export const Header: React.FC = () => {
  const { user, role, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  // Generate simple breadcrumbs from pathname
  const pathnames = location.pathname.split('/').filter((x) => x)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Helper map for breadcrumb translations
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    inventory: 'Inventario',
    catalog: 'Catálogos',
    suppliers: 'Proveedores',
    categories: 'Categorías',
    colors: 'Colores',
    sizes: 'Tallas',
    genders: 'Géneros',
    movements: 'Movimientos',
    purchase: 'Compras',
    sale: 'Ventas',
    reports: 'Reportes',
    users: 'Usuarios',
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border-soft bg-surface-card px-6 shadow-sm transition-colors dark:border-border-soft dark:bg-card">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-sm font-medium text-text-muted dark:text-text-muted">
        <Link to="/" className="hover:text-primary transition-colors">
          Inicio
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const translatedName = breadcrumbMap[name] || name

          return (
            <React.Fragment key={name}>
              <ChevronRight className="h-4 w-4 text-text-muted/50" />
              {isLast ? (
                <span className="font-semibold text-text-base dark:text-text-base">
                  {translatedName}
                </span>
              ) : (
                <Link to={routeTo} className="hover:text-primary transition-colors">
                  {translatedName}
                </Link>
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* Action Controls */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft bg-transparent hover:bg-surface/50 text-text-base transition-colors dark:border-border-soft dark:hover:bg-muted/50 dark:text-white"
          aria-label="Alternar modo oscuro"
        >
          {theme === 'dark' ? (
            <Sun className="h-4.5 w-4.5" strokeWidth={2} />
          ) : (
            <Moon className="h-4.5 w-4.5" strokeWidth={2} />
          )}
        </button>

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 border border-primary/20 hover:border-primary transition-colors shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 border border-border-soft dark:border-border-soft">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-display">
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-base dark:text-white">{user.username}</span>
                    <span className="text-xs text-text-muted truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border-soft dark:bg-border-soft" />
              <DropdownMenuItem disabled className="text-xs uppercase tracking-widest font-mono text-primary font-semibold py-1.5">
                Rol: {role}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-soft dark:bg-border-soft" />
              <DropdownMenuItem
                onClick={logout}
                className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer font-medium"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

export default Header
