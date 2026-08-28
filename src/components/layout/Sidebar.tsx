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
  Truck,
  Tags,
  Palette,
  Ruler,
  UsersRound,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getRolesApi, ROLE_KEYS } from '../../api/roles'

export const Sidebar: React.FC = () => {
  const { role, sidebarOpen, toggleSidebar, logout, user } = useAuthStore()
  const location = useLocation()
  const { data: roles = [] } = useQuery({ queryKey: ROLE_KEYS.all, queryFn: getRolesApi })
  const displayRole = roles.find((item) => item.id_role === role)?.name || role || 'Sin rol'
  const displayName = user?.username && !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(user.username)
    ? user.username
    : 'Usuario'

  const handleLogout = () => {
    logout()
  }

  // Define menu items based on role
  const adminItems = [
        { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { path: ROUTES.INVENTORY, label: 'Inventario', icon: Package },
        {
          label: 'Catálogos',
          icon: FolderOpen,
          isHeader: true,
        },
        { path: ROUTES.CATALOGS.SUPPLIERS, label: 'Proveedores', icon: Truck, isSub: true },
        { path: ROUTES.CATALOGS.CATEGORIES, label: 'Categorías', icon: Tags, isSub: true },
        { path: ROUTES.CATALOGS.COLORS, label: 'Colores', icon: Palette, isSub: true },
        { path: ROUTES.CATALOGS.SIZES, label: 'Tallas', icon: Ruler, isSub: true },
        { path: ROUTES.CATALOGS.GENDERS, label: 'Géneros', icon: UsersRound, isSub: true },
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
  const operatorItems = [
    { path: ROUTES.INVENTORY, label: 'Inventario', icon: Package },
    { path: ROUTES.PURCHASES, label: 'Compras', icon: ShoppingBag },
    { path: ROUTES.SALES, label: 'Ventas', icon: ShoppingCart },
    { path: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 },
  ]
  const consultationItems = [
    { path: ROUTES.INVENTORY, label: 'Inventario', icon: Package },
    { path: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 },
  ]
  const menuItems = displayRole === 'Admin' ? adminItems : displayRole === 'Operator' ? operatorItems : consultationItems

  const SidebarLogo = () => (
    <div className="flex h-16 items-center gap-3 border-b border-white/10 px-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e2cef6] text-[#5b0672] shadow-sm">
        <Package className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </div>
      {sidebarOpen && (
        <span className="font-display font-semibold text-lg text-white tracking-wide truncate">
          Pañalera <span className="text-white/55">Pro</span>
        </span>
      )}
    </div>
  )

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#5b0672] text-white transition-[width] duration-200 ${
          sidebarOpen ? 'w-64' : 'w-[4.5rem]'
        }`}
      >
        <SidebarLogo />

        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {menuItems.map((item, index) => {
            if (item.isHeader) {
              if (!sidebarOpen) return <div key={index} className="h-px bg-white/10 my-4" />
              return (
                <div
                  key={index}
                  className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45"
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
                  `flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#e2cef6] text-[#5b0672] font-semibold shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
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
        <div className="space-y-2 border-t border-white/10 p-2.5">
          {sidebarOpen && user && (
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white">
              <p className="text-xs font-display font-medium text-white/60 truncate">Autenticado como</p>
              <p className="text-sm font-semibold truncate" title={displayName}>{displayName}</p>
              <p className="text-[10px] font-mono opacity-80 uppercase tracking-widest">{displayRole}</p>
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
