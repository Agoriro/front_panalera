import React, { useState } from 'react'
import { useReports } from './useReports'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Home, Percent, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import * as XLSX from 'xlsx'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export const SalesReportPage: React.FC = () => {
  // Date Range Defaults (Last 30 Days)
  const [startDateStr, setStartDateStr] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDateStr, setEndDateStr] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [appliedDates, setAppliedDates] = useState({ start: startDateStr, end: endDateStr })
  const [activeTab, setActiveTab] = useState('inicio')
  const [page, setPage] = useState(1)
  const [visibleReports, setVisibleReports] = useState<Record<string, boolean>>({})
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })

  const { movements, totals, pagination, isLoadingMovements, inventory, isLoadingInventory } = useReports({
    date_from: new Date(`${appliedDates.start}T00:00:00`).toISOString(),
    date_to: new Date(`${appliedDates.end}T23:59:59`).toISOString(),
    page,
    page_size: 25,
  })

  // Grouping Sales movements
  const salesMovements = movements.filter((m) => m.type_movement === 'SELL')

  const applyFilters = () => {
    setPage(1)
    setAppliedDates({ start: startDateStr, end: endDateStr })
    setVisibleReports((current) => ({ ...current, [activeTab]: true }))
  }

  const changeSort = (key: string) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
  }

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const Icon = sort.key !== column ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown
    return (
      <button type="button" onClick={() => changeSort(column)} className="flex w-full min-h-10 items-center gap-1.5 text-left hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label={`Ordenar por ${String(children)}`}>
        <span>{children}</span><Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    )
  }

  const sortedSales = [...salesMovements].sort((a, b) => {
    const values: Record<string, [string | number, string | number]> = {
      article: [a.inventory?.description || '', b.inventory?.description || ''],
      date: [new Date(a.created_at).getTime(), new Date(b.created_at).getTime()],
      quantity: [a.quantity, b.quantity],
      unitPrice: [Number(a.value), Number(b.value)],
      total: [a.quantity * Number(a.value), b.quantity * Number(b.value)],
      profit: [a.quantity * (Number(a.value) - Number(a.unit_cost)), b.quantity * (Number(b.value) - Number(b.unit_cost))],
    }
    const [left, right] = values[sort.key] || values.date
    const comparison = typeof left === 'string' ? left.localeCompare(String(right), 'es', { sensitivity: 'base' }) : left - Number(right)
    return sort.direction === 'asc' ? comparison : -comparison
  })

  const sortedInventory = [...inventory].sort((a, b) => {
    const values: Record<string, [string | number, string | number]> = {
      article: [a.description, b.description],
      category: [a.category?.name || '', b.category?.name || ''],
      stock: [a.stock_qty || 0, b.stock_qty || 0],
      cost: [a.cost_price || 0, b.cost_price || 0],
      valuation: [(a.stock_qty || 0) * (a.cost_price || 0), (b.stock_qty || 0) * (b.cost_price || 0)],
    }
    const [left, right] = values[sort.key] || values.article
    const comparison = typeof left === 'string' ? left.localeCompare(String(right), 'es', { sensitivity: 'base' }) : left - Number(right)
    return sort.direction === 'asc' ? comparison : -comparison
  })

  // Calculated KPI values
  const totalSalesVal = Number(totals.revenue)
  
  // Calculate utility: utility = (sale_value - cost_value) * quantity
  // Since sale price is sale_value and cost is cost_price:
  // cost = sale_value / (1 + utility_percent / 100)
  // utility = sale_value - cost
  const totalUtilityVal = Number(totals.profit)

  // Chart Data: group sales by day
  const getChartData = () => {
    const dates = eachDayOfInterval({
      start: new Date(appliedDates.start),
      end: new Date(appliedDates.end),
    })

    return dates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = salesMovements.filter((m) => format(new Date(m.created_at), 'yyyy-MM-dd') === dateStr)
      const salesSum = daySales.reduce((sum, m) => sum + m.quantity * Number(m.value), 0)
      const utilitySum = daySales.reduce((sum, m) => {
        const saleTotal = m.quantity * Number(m.value)
        const utilityPercent = m.inventory?.utility || 30
        const costTotal = saleTotal / (1 + utilityPercent / 100)
        return sum + (saleTotal - costTotal)
      }, 0)

      return {
        fecha: format(date, 'dd/MM'),
        Ventas: salesSum,
        Utilidad: Math.round(utilitySum)
      }
    })
  }

  // Projection logic (30-day Moving Average)
  const getProjectionData = () => {
    // 1. Get sales for the last 30 days grouped by day
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = movements.filter(
        (m) => m.type_movement === 'SELL' && format(new Date(m.created_at), 'yyyy-MM-dd') === dateStr
      )
      const salesSum = daySales.reduce((sum, m) => sum + m.quantity * Number(m.value), 0)
      return {
        dateStr,
        label: format(date, 'dd/MM'),
        sales: salesSum
      }
    })

    // 2. Calculate moving average
    const totalSales30 = last30Days.reduce((sum, d) => sum + d.sales, 0)
    const movingAverage = Math.round(totalSales30 / 30)

    // 3. Project for the next 7 days
    const chartPoints = last30Days.map((d) => ({
      name: d.label,
      Ventas: d.sales,
      Proyección: null as number | null
    }))

    // Add last point connect
    if (chartPoints.length > 0) {
      chartPoints[chartPoints.length - 1].Proyección = chartPoints[chartPoints.length - 1].Ventas
    }

    for (let i = 1; i <= 7; i++) {
      const pDate = new Date()
      pDate.setDate(pDate.getDate() + i)
      chartPoints.push({
        name: format(pDate, 'dd/MM') + '*',
        Ventas: null as any,
        Proyección: movingAverage
      })
    }

    return chartPoints
  }

  // Excel Sales Export
  const handleExportSalesExcel = () => {
    const excelData = salesMovements.map((m) => ({
      Artículo: m.inventory?.description || 'Artículo',
      Fecha: new Date(m.created_at).toLocaleString('es-CO'),
      Cantidad: m.quantity,
      'Precio Unitario': m.value,
      'Total Venta': m.quantity * Number(m.value),
      'Utilidad %': m.inventory?.utility || 0,
      'Utilidad Estimada': Math.round(m.quantity * Number(m.value) - (m.quantity * Number(m.value)) / (1 + (m.inventory?.utility || 30) / 100)),
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Ventas')
    XLSX.writeFile(workbook, `Reporte_Ventas_${startDateStr}_a_${endDateStr}.xlsx`)
  }

  // PDF Export via native browser print
  const handleExportPdf = () => {
    const rows = salesMovements.map((m) => {
      const total = m.quantity * Number(m.value)
      const utilPct = m.inventory?.utility || 30
      const utility = total - total / (1 + utilPct / 100)
      return `
        <tr>
          <td>${m.inventory?.description || 'Artículo'}</td>
          <td>${new Date(m.created_at).toLocaleDateString('es-CO')}</td>
          <td>${m.quantity} uds</td>
          <td>$${Number(m.value).toLocaleString('es-CO')}</td>
          <td>$${total.toLocaleString('es-CO')}</td>
          <td>$${Math.round(utility).toLocaleString('es-CO')}</td>
        </tr>`
    }).join('')

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Reporte de Ventas</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #2D2D3A; padding: 30px; }
        h1 { color: #8A0BD2; font-size: 20px; margin-bottom: 4px; }
        p { margin: 2px 0; color: #6B6B7B; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #8A0BD2; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 7px 8px; border-bottom: 1px solid #E8E4F0; font-size: 11px; }
        tr:nth-child(even) td { background: #FAFAF8; }
        .totals { margin-top: 20px; text-align: right; }
        .totals p { font-size: 13px; font-weight: bold; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>Reporte de Ventas y Utilidades</h1>
      <p>Período: ${startDateStr} al ${endDateStr}</p>
      <p>Generado: ${new Date().toLocaleDateString('es-CO')}</p>
      <table>
        <thead><tr>
          <th>Artículo</th><th>Fecha</th><th>Cantidad</th>
          <th>Precio Unit.</th><th>Total Venta</th><th>Utilidad Est.</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <p>Total Recaudado: $${Math.round(totalSalesVal).toLocaleString('es-CO')}</p>
        <p style="color:#5B0672">Utilidad Estimada: $${Math.round(totalUtilityVal).toLocaleString('es-CO')}</p>
      </div>
      <script>window.onload = () => { window.print(); }<\/script>
      </body></html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  // Excel Stock Export
  const handleExportStockExcel = () => {
    const excelData = inventory.map((item) => ({
      Descripción: item.description,
      Categoría: item.category?.name || 'N/A',
      Color: item.color?.name || 'N/A',
      Talla: item.size?.name || 'N/A',
      Género: item.gender?.name || 'N/A',
      'Stock Actual': Number(item.stock_qty ?? 0),
      'Costo Unitario': Number(item.cost_price ?? 0),
      'Valor Costo Total': Number(item.stock_qty ?? 0) * Number(item.cost_price ?? 0),
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Valoración de Inventario')
    XLSX.writeFile(workbook, `Existencias_Inventario_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  const ReportToolbar = ({ onExcel, onPdf }: { onExcel: () => void; onPdf?: () => void }) => (
    <Card className="border-border-soft bg-surface-card dark:border-border-soft dark:bg-card">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor={`${activeTab}-start`} className="text-xs">Fecha inicial</Label>
          <Input id={`${activeTab}-start`} type="date" value={startDateStr} onChange={(event) => setStartDateStr(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${activeTab}-end`} className="text-xs">Fecha final</Label>
          <Input id={`${activeTab}-end`} type="date" value={endDateStr} onChange={(event) => setEndDateStr(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={applyFilters} className="gap-2"><Eye className="h-4 w-4" aria-hidden="true" />Ver informe</Button>
          <Button type="button" onClick={onExcel} variant="outline" className="gap-2"><FileSpreadsheet className="h-4 w-4" aria-hidden="true" />Excel</Button>
          {onPdf && <Button type="button" onClick={onPdf} variant="outline" className="gap-2"><FileText className="h-4 w-4" aria-hidden="true" />PDF</Button>}
        </div>
      </CardContent>
    </Card>
  )

  const Pagination = ({ pages = 1 }: { pages?: number }) => (
    <div className="flex items-center justify-between border-t border-border-soft pt-4 text-sm">
      <span className="text-text-muted">Página {page} de {Math.max(pages, 1)} · 25 registros por página</span>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.min(Math.max(pages, 1), current + 1))} disabled={page >= Math.max(pages, 1)} aria-label="Página siguiente"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
          Reportes y Estadísticas
        </h1>
        <p className="text-sm text-text-muted">
          Genera balances de ventas, proyecciones de demanda y descargables para contabilidad.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setPage(1); setSort({ key: 'date', direction: 'desc' }) }} className="flex w-full flex-col gap-6">
        <TabsList className="!flex !h-14 !min-h-14 !max-h-14 w-full flex-none items-center justify-start gap-2 overflow-x-auto overflow-y-hidden rounded-xl border border-border-soft bg-surface-card p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-border-soft dark:bg-card">
          <TabsTrigger value="inicio" className="!h-11 !min-h-11 !max-h-11 flex-none rounded-lg border border-border-soft px-5 font-display text-sm hover:bg-[#e2cef6]/60 hover:text-primary-dark data-active:border-primary data-active:bg-primary data-active:text-primary-foreground dark:hover:bg-primary/15 dark:data-active:bg-primary dark:data-active:text-primary-foreground"><Home className="h-4 w-4" aria-hidden="true" />Inicio</TabsTrigger>
          <TabsTrigger value="periodo" className="!h-11 !min-h-11 !max-h-11 flex-none rounded-lg border border-border-soft px-5 font-display text-sm hover:bg-[#e2cef6]/60 hover:text-primary-dark data-active:border-primary data-active:bg-primary data-active:text-primary-foreground dark:hover:bg-primary/15 dark:data-active:bg-primary dark:data-active:text-primary-foreground">Ventas por Período</TabsTrigger>
          <TabsTrigger value="existencias" className="!h-11 !min-h-11 !max-h-11 flex-none rounded-lg border border-border-soft px-5 font-display text-sm hover:bg-[#e2cef6]/60 hover:text-primary-dark data-active:border-primary data-active:bg-primary data-active:text-primary-foreground dark:hover:bg-primary/15 dark:data-active:bg-primary dark:data-active:text-primary-foreground">Existencias (Valorización)</TabsTrigger>
          <TabsTrigger value="proyeccion" className="!h-11 !min-h-11 !max-h-11 flex-none rounded-lg border border-border-soft px-5 font-display text-sm hover:bg-[#e2cef6]/60 hover:text-primary-dark data-active:border-primary data-active:bg-primary data-active:text-primary-foreground dark:hover:bg-primary/15 dark:data-active:bg-primary dark:data-active:text-primary-foreground">Proyección de Ventas</TabsTrigger>
        </TabsList>

        <TabsContent value="inicio" className="w-full flex-none space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-border-soft bg-surface-card dark:border-border-soft dark:bg-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total ventas</p><p className="mt-2 font-mono text-2xl font-bold">{formatCurrency(totalSalesVal)}</p></div><ShoppingCart className="h-6 w-6 text-primary" aria-hidden="true" /></CardContent></Card>
            <Card className="border-border-soft bg-surface-card dark:border-border-soft dark:bg-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Utilidad estimada</p><p className="mt-2 font-mono text-2xl font-bold text-secondary">{formatCurrency(totalUtilityVal)}</p></div><DollarSign className="h-6 w-6 text-secondary" aria-hidden="true" /></CardContent></Card>
            <Card className="border-border-soft bg-surface-card dark:border-border-soft dark:bg-card"><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Margen promedio</p><p className="mt-2 font-mono text-2xl font-bold">{totalSalesVal > 0 ? Math.round((totalUtilityVal / totalSalesVal) * 100) : 0}%</p></div><Percent className="h-6 w-6 text-primary" aria-hidden="true" /></CardContent></Card>
          </div>
          <Card className="border-border-soft bg-surface-card dark:border-border-soft dark:bg-card">
            <CardHeader><CardTitle className="font-display text-base font-semibold">Ventas y utilidades por día</CardTitle><CardDescription>Comportamiento del período aplicado actualmente.</CardDescription></CardHeader>
            <CardContent className="h-80">{isLoadingMovements ? <Skeleton className="h-full w-full" /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="fecha" tickLine={false} axisLine={false} style={{ fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} style={{ fontSize: 10 }} /><RechartsTooltip formatter={(value) => formatCurrency(Number(value))} /><Legend /><Bar dataKey="Ventas" fill="#8A0BD2" radius={[4, 4, 0, 0]} /><Bar dataKey="Utilidad" fill="#AF50E5" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>}</CardContent>
          </Card>
        </TabsContent>

        {/* Tab 1: Ventas por periodo */}
        <TabsContent value="periodo" className="w-full flex-none space-y-6">
          <ReportToolbar onExcel={handleExportSalesExcel} onPdf={handleExportPdf} />

          {false && <>
          {/* Key Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Ventas</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-text-base dark:text-white">{formatCurrency(totalSalesVal)}</span>
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">Utilidad Estimada</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-secondary">{formatCurrency(totalUtilityVal)}</span>
                <div className="bg-secondary/10 p-2.5 rounded-lg text-secondary">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-text-muted">Margen Promedio</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-accent">
                  {totalSalesVal > 0 ? Math.round((totalUtilityVal / totalSalesVal) * 100) : 0}%
                </span>
                <div className="bg-accent/10 p-2.5 rounded-lg text-accent">
                  <Percent className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales BarChart */}
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">Gráfico de Ventas y Utilidades por Día</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {isLoadingMovements ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="fecha" tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="Ventas" fill="#8A0BD2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Utilidad" fill="#AF50E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          </>}

          {/* Sales table */}
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">Movimientos de Venta del Período</CardTitle>
            </CardHeader>
            <CardContent>
              {!visibleReports.periodo ? (
                <div className="py-10 text-center text-sm text-text-muted">Selecciona las fechas y pulsa “Ver informe”.</div>
              ) : isLoadingMovements ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : salesMovements.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No se registraron ventas en este período.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold"><SortableHeader column="article">Artículo</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="date">Fecha</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="quantity">Cantidad</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="unitPrice">Precio Unit.</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="total">Venta Total</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="profit">Utilidad Est.</SortableHeader></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSales.map((m) => {
                      const totalSale = m.quantity * Number(m.value)
                      const cost = totalSale / (1 + (m.inventory?.utility || 30) / 100)
                      const utility = totalSale - cost

                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-text-base dark:text-white">{m.inventory?.description}</TableCell>
                          <TableCell className="text-xs">{formatDate(m.created_at)}</TableCell>
                          <TableCell>{m.quantity} uds</TableCell>
                          <TableCell className="font-mono text-xs">{formatCurrency(Number(m.value))}</TableCell>
                          <TableCell className="font-mono font-semibold text-text-base dark:text-white">{formatCurrency(totalSale)}</TableCell>
                          <TableCell className="font-mono font-semibold text-secondary">{formatCurrency(Math.round(utility))}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              {visibleReports.periodo && <Pagination pages={pagination?.pages} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Existencias / Valoración de Inventario */}
        <TabsContent value="existencias" className="w-full flex-none space-y-6">
          <ReportToolbar onExcel={handleExportStockExcel} />
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
              <div>
                <CardTitle className="font-display text-base font-semibold">Valoración Física de Inventario</CardTitle>
                <CardDescription>Muestra el stock actual de mercancías valorizado al costo real.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!visibleReports.existencias ? (
                <div className="py-10 text-center text-sm text-text-muted">Selecciona las fechas y pulsa “Ver informe”.</div>
              ) : isLoadingInventory ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : inventory.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No hay artículos cargados.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold"><SortableHeader column="article">Artículo</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="category">Categoría</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="stock">Stock Actual</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="cost">Costo Unit.</SortableHeader></TableHead>
                      <TableHead className="font-semibold"><SortableHeader column="valuation">Valor Costo Total</SortableHeader></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInventory.slice((page - 1) * 25, page * 25).map((item) => {
                      const stock = Number(item.stock_qty ?? 0)
                      const cost = Number(item.cost_price ?? 0)
                      const totalVal = stock * cost

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-text-base dark:text-white">{item.description}</TableCell>
                          <TableCell>{item.category?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              stock === 0 ? 'bg-danger/15 text-danger' : 'bg-secondary/15 text-secondary'
                            }`}>
                              {stock} uds
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{formatCurrency(cost)}</TableCell>
                          <TableCell className="font-mono font-semibold">{formatCurrency(totalVal)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              {visibleReports.existencias && <Pagination pages={Math.ceil(inventory.length / 25)} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Proyecciones */}
        <TabsContent value="proyeccion" className="w-full flex-none space-y-6">
          <ReportToolbar onExcel={handleExportSalesExcel} onPdf={handleExportPdf} />
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary animate-bounce" />
                Proyección de Ventas (Próximos 7 días)
              </CardTitle>
              <CardDescription>
                Calcula la demanda futura mediante el promedio móvil de los últimos 30 días históricos. Los días marcados con asterisco (*) corresponden a proyecciones estimadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {!visibleReports.proyeccion ? (
                <div className="flex h-full items-center justify-center text-sm text-text-muted">Selecciona las fechas y pulsa “Ver informe”.</div>
              ) : isLoadingMovements ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getProjectionData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 9 }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 9 }} />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="Ventas" stroke="#8A0BD2" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Proyección" stroke="#D980F9" strokeWidth={2} strokeDasharray="5 5" dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SalesReportPage
