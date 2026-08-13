import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { ROUTES } from '../../router/routes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  ShoppingCart,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { role, sidebarOpen, toggleSidebar, logout, user } = useAuthStore()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  // Define menu items based on role
  const menuItems = role === 'Admin'
    ? [
        { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { path: ROUTES.INVENTORY, label: 'Inventario', icon: Package },
        {
          label: 'Catálogos',
          icon: FolderOpen,
          isHeader: true,
        },
        { path: ROUTES.CATALOGS.SUPPLIERS, label: 'Proveedores', icon: FolderOpen, isSub: true },
        { path: ROUTES.CATALOGS.CATEGORIES, label: 'Categorías', icon: FolderOpen, isSub: true },
        { path: ROUTES.CATALOGS.COLORS, label: 'Colores', icon: FolderOpen, isSub: true },
        { path: ROUTES.CATALOGS.SIZES, label: 'Tallas', icon: FolderOpen, isSub: true },
        { path: ROUTES.CATALOGS.GENDERS, label: 'Géneros', icon: FolderOpen, isSub: true },
        {
          label: 'Operaciones',
          icon: ShoppingBag,
          isHeader: true,
        },
        { path: ROUTES.PURCHASES, label: 'Compras', icon: ShoppingBag, isSub: true },
        { path: ROUTES.SALES, label: 'Ventas', icon: ShoppingCart, isSub: true },
        { path: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 },
        { path: ROUTES.USERS, label: 'Usuarios', icon: Users },
      ]
    : [
        { path: ROUTES.SALES, label: 'Ventas', icon: ShoppingCart },
      ]

  const SidebarLogo = () => (
    <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
        {/* Cute Baby Cradle SVG */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M3 20c4-2 14-2 18 0" />
          <rect x="5" y="8" width="14" height="9" rx="1.5" />
          <path d="M8 8v9" />
          <path d="M12 8v9" />
          <path d="M16 8v9" />
          <path d="M5 8c0-3 3-4 6-4" />
        </svg>
      </div>
      {sidebarOpen && (
        <span className="font-display font-semibold text-lg text-white tracking-wide truncate">
          Pañalera
        </span>
      )}
    </div>
  )

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-primary dark:bg-[#1E1B2E] transition-all duration-300 shadow-xl ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <SidebarLogo />

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {menuItems.map((item, index) => {
            if (item.isHeader) {
              if (!sidebarOpen) return <div key={index} className="h-px bg-white/10 my-4" />
              return (
                <div
                  key={index}
                  className="px-3 pt-4 pb-1 text-xs font-display font-medium text-white/50 uppercase tracking-wider"
                >
                  {item.label}
                </div>
              )
            }

            const Icon = item.icon!
            const isActive = location.pathname === item.path

            const LinkContent = (
              <NavLink
                to={item.path!}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-dark text-white font-semibold shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${item.isSub && sidebarOpen ? 'pl-6' : ''}`
                }
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            )

            if (!sidebarOpen) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger render={LinkContent} />
                  <TooltipContent side="right" className="bg-primary-dark text-white border-none font-display">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <React.Fragment key={index}>{LinkContent}</React.Fragment>
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {sidebarOpen && user && (
            <div className="px-3 py-2 bg-white/10 rounded-lg text-white">
              <p className="text-xs font-display font-medium text-white/60 truncate">Autenticado como</p>
              <p className="text-sm font-semibold truncate">{user.username}</p>
              <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest">{role}</p>
            </div>
          )}

          <div className={`flex ${sidebarOpen ? 'flex-row' : 'flex-col'} gap-2`}>
            <button
              onClick={toggleSidebar}
              className={`flex items-center justify-center p-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors ${
                sidebarOpen ? 'flex-1' : 'w-full'
              }`}
              aria-label={sidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-danger/10 hover:bg-danger text-white/90 hover:text-white transition-colors w-full flex items-center justify-center"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                }
              />
              <TooltipContent side="right" className="bg-danger text-white border-none font-display">
                Cerrar sesión
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export default Sidebar
