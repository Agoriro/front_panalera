import React from 'react'
import { useReports } from '../reports/useReports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, ShoppingBag, ShoppingCart, AlertTriangle, TrendingUp, Award, Box } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { format, subDays, startOfMonth } from 'date-fns'

export const DashboardPage: React.FC = () => {
  const { movements, isLoadingMovements, inventory, isLoadingInventory } = useReports()

  const salesMovements = movements.filter((m) => m.type_movement === 'SELL')
  const purchaseMovements = movements.filter((m) => m.type_movement === 'BUY')

  // Date filtering helpers
  const today = new Date()
  const firstDayOfMonth = startOfMonth(today)

  // 1. KPI Calculations (Current Month)
  const currentMonthSales = salesMovements.filter((m) => new Date(m.created_at) >= firstDayOfMonth)
  const totalSalesVal = currentMonthSales.reduce((sum, m) => sum + m.quantity * m.value, 0)

  const currentMonthPurchases = purchaseMovements.filter((m) => new Date(m.created_at) >= firstDayOfMonth)
  const totalPurchasesVal = currentMonthPurchases.reduce((sum, m) => sum + m.quantity * m.value, 0)

  const totalUtilityVal = currentMonthSales.reduce((sum, m) => {
    const saleTotal = m.quantity * m.value
    const utilityPercent = m.inventory?.utility || 30
    const costTotal = saleTotal / (1 + utilityPercent / 100)
    return sum + (saleTotal - costTotal)
  }, 0)

  // Low stock products count
  const lowStockItems = inventory.filter((item) => item.stock_qty < 5)

  // 2. Chart Data: last 30 days daily sales
  const getChartData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = salesMovements.filter((m) => format(new Date(m.created_at), 'yyyy-MM-dd') === dateStr)
      const salesSum = daySales.reduce((sum, m) => sum + m.quantity * m.value, 0)
      return {
        fecha: format(date, 'dd/MM'),
        Ventas: salesSum,
      }
    })
    return last30Days
  }

  // 3. Top 5 Best-Selling Products
  const getTopProducts = () => {
    const productSalesMap: Record<string, { desc: string; qty: number; total: number; size: string }> = {}

    salesMovements.forEach((m) => {
      if (!m.id_inventory) return
      const key = m.id_inventory
      const itemQty = m.quantity
      const itemVal = m.quantity * m.value
      const desc = m.inventory?.description || 'Artículo N/A'
      const size = m.inventory?.size?.name || 'S/T'

      if (productSalesMap[key]) {
        productSalesMap[key].qty += itemQty
        productSalesMap[key].total += itemVal
      } else {
        productSalesMap[key] = { desc, qty: itemQty, total: itemVal, size }
      }
    })

    return Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }

  const topProducts = getTopProducts()

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
          Panel de Control Administrativo
        </h1>
        <p className="text-sm text-text-muted">
          Revisa el rendimiento comercial de la pañalera, ventas mensuales y estado de inventario.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Ventas Mes */}
        <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Ventas del Mes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            {isLoadingMovements ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="font-mono text-2xl font-bold text-text-base dark:text-white">
                {formatCurrency(totalSalesVal)}
              </span>
            )}
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Utilidades Mes */}
        <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Utilidad Estimada Mes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            {isLoadingMovements ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="font-mono text-2xl font-bold text-secondary">
                {formatCurrency(Math.round(totalUtilityVal))}
              </span>
            )}
            <div className="bg-secondary/10 p-2.5 rounded-lg text-secondary">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Compras Mes */}
        <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Compras Facturadas Mes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            {isLoadingMovements ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="font-mono text-2xl font-bold text-text-base dark:text-white">
                {formatCurrency(totalPurchasesVal)}
              </span>
            )}
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Stock Crítico */}
        <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Artículos Stock Bajo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-between">
            {isLoadingInventory ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span
                className={`font-mono text-2xl font-bold ${
                  lowStockItems.length > 0 ? 'text-danger' : 'text-text-base dark:text-white'
                }`}
              >
                {lowStockItems.length}
              </span>
            )}
            <div
              className={`p-2.5 rounded-lg ${
                lowStockItems.length > 0 ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2/3 width) */}
        <Card className="lg:col-span-2 border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Tendencia de Ventas (Últimos 30 días)
            </CardTitle>
            <CardDescription>Ventas diarias registradas.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isLoadingMovements ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="fecha" tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="Ventas"
                    stroke="#9B7DB6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Products (1/3 width) */}
        <Card className="lg:col-span-1 border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-secondary" />
              Más Vendidos (Top 5)
            </CardTitle>
            <CardDescription>Productos de mayor rotación histórica.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMovements ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <Box className="h-8 w-8 text-text-muted/40 mb-2" />
                <p className="text-xs">No se registran ventas acumuladas.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-xs">Producto</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Cant.</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((prod, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs max-w-[130px] truncate">
                        {prod.desc} <span className="text-[10px] text-text-muted">({prod.size})</span>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">{prod.qty} uds</TableCell>
                      <TableCell className="text-right text-xs font-mono font-semibold text-secondary">
                        {formatCurrency(prod.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
