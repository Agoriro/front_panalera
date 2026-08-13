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
import { FileSpreadsheet, FileText, Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import * as XLSX from 'xlsx'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export const SalesReportPage: React.FC = () => {
  // Date Range Defaults (Last 30 Days)
  const [startDateStr, setStartDateStr] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDateStr, setEndDateStr] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { movements, isLoadingMovements, inventory, isLoadingInventory } = useReports({
    start_date: new Date(startDateStr).toISOString(),
    end_date: new Date(endDateStr).toISOString()
  })

  // Grouping Sales movements
  const salesMovements = movements.filter((m) => m.type_movement === 'SELL')

  // Calculated KPI values
  const totalSalesVal = salesMovements.reduce((sum, m) => sum + m.quantity * m.value, 0)
  
  // Calculate utility: utility = (sale_value - cost_value) * quantity
  // Since sale price is sale_value and cost is cost_price:
  // cost = sale_value / (1 + utility_percent / 100)
  // utility = sale_value - cost
  const totalUtilityVal = salesMovements.reduce((sum, m) => {
    const saleTotal = m.quantity * m.value
    const utilityPercent = m.inventory?.utility || 30
    const costTotal = saleTotal / (1 + utilityPercent / 100)
    return sum + (saleTotal - costTotal)
  }, 0)

  // Chart Data: group sales by day
  const getChartData = () => {
    const dates = eachDayOfInterval({
      start: new Date(startDateStr),
      end: new Date(endDateStr),
    })

    return dates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = salesMovements.filter((m) => format(new Date(m.created_at), 'yyyy-MM-dd') === dateStr)
      const salesSum = daySales.reduce((sum, m) => sum + m.quantity * m.value, 0)
      const utilitySum = daySales.reduce((sum, m) => {
        const saleTotal = m.quantity * m.value
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
      const salesSum = daySales.reduce((sum, m) => sum + m.quantity * m.value, 0)
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
      'Total Venta': m.quantity * m.value,
      'Utilidad %': m.inventory?.utility || 0,
      'Utilidad Estimada': Math.round(m.quantity * m.value - (m.quantity * m.value) / (1 + (m.inventory?.utility || 30) / 100)),
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Ventas')
    XLSX.writeFile(workbook, `Reporte_Ventas_${startDateStr}_a_${endDateStr}.xlsx`)
  }

  // PDF Export via native browser print
  const handleExportPdf = () => {
    const rows = salesMovements.map((m) => {
      const total = m.quantity * m.value
      const utilPct = m.inventory?.utility || 30
      const utility = total - total / (1 + utilPct / 100)
      return `
        <tr>
          <td>${m.inventory?.description || 'Artículo'}</td>
          <td>${new Date(m.created_at).toLocaleDateString('es-CO')}</td>
          <td>${m.quantity} uds</td>
          <td>$${m.value.toLocaleString('es-CO')}</td>
          <td>$${total.toLocaleString('es-CO')}</td>
          <td>$${Math.round(utility).toLocaleString('es-CO')}</td>
        </tr>`
    }).join('')

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Reporte de Ventas</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #2D2D3A; padding: 30px; }
        h1 { color: #9B7DB6; font-size: 20px; margin-bottom: 4px; }
        p { margin: 2px 0; color: #6B6B7B; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #9B7DB6; color: white; padding: 8px; text-align: left; font-size: 11px; }
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
        <p style="color:#7CC4A4">Utilidad Estimada: $${Math.round(totalUtilityVal).toLocaleString('es-CO')}</p>
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
      'Stock Actual': item.stock_qty,
      'Costo Unitario': item.cost_price || 0,
      'Valor Costo Total': item.stock_qty * (item.cost_price || 0),
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Valoración de Inventario')
    XLSX.writeFile(workbook, `Existencias_Inventario_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

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

      <Tabs defaultValue="periodo" className="space-y-6">
        <TabsList className="bg-surface-card border border-border-soft dark:border-border-soft dark:bg-card">
          <TabsTrigger value="periodo" className="font-display text-sm">Ventas por Período</TabsTrigger>
          <TabsTrigger value="existencias" className="font-display text-sm">Existencias (Valorización)</TabsTrigger>
          <TabsTrigger value="proyeccion" className="font-display text-sm">Proyección de Ventas</TabsTrigger>
        </TabsList>

        {/* Tab 1: Ventas por periodo */}
        <TabsContent value="periodo" className="space-y-6">
          {/* Filters card */}
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-base font-semibold">Selector de Rango de Fechas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-end gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="start_date" className="text-xs">Fecha Inicio</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="start_date"
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <Label htmlFor="end_date" className="text-xs">Fecha Fin</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="end_date"
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                  onClick={handleExportSalesExcel}
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2 h-10 text-xs"
                >
                  <FileSpreadsheet className="h-4 w-4 text-secondary" />
                  Exportar Excel
                </Button>

                <Button
                  onClick={handleExportPdf}
                  variant="outline"
                  className="w-full sm:w-auto gap-2 h-10 text-xs"
                >
                  <FileText className="h-4 w-4 text-danger" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    <Bar dataKey="Ventas" fill="#9B7DB6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Utilidad" fill="#7CC4A4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Sales table */}
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">Movimientos de Venta del Período</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMovements ? (
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
                      <TableHead className="font-semibold">Artículo</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="font-semibold">Cantidad</TableHead>
                      <TableHead className="font-semibold">Precio Unit.</TableHead>
                      <TableHead className="font-semibold">Venta Total</TableHead>
                      <TableHead className="font-semibold">Utilidad Est.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesMovements.map((m) => {
                      const totalSale = m.quantity * m.value
                      const cost = totalSale / (1 + (m.inventory?.utility || 30) / 100)
                      const utility = totalSale - cost

                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-text-base dark:text-white">{m.inventory?.description}</TableCell>
                          <TableCell className="text-xs">{formatDate(m.created_at)}</TableCell>
                          <TableCell>{m.quantity} uds</TableCell>
                          <TableCell className="font-mono text-xs">{formatCurrency(m.value)}</TableCell>
                          <TableCell className="font-mono font-semibold text-text-base dark:text-white">{formatCurrency(totalSale)}</TableCell>
                          <TableCell className="font-mono font-semibold text-secondary">{formatCurrency(Math.round(utility))}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Existencias / Valoración de Inventario */}
        <TabsContent value="existencias" className="space-y-6">
          <Card className="border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
              <div>
                <CardTitle className="font-display text-base font-semibold">Valoración Física de Inventario</CardTitle>
                <CardDescription>Muestra el stock actual de mercancías valorizado al costo real.</CardDescription>
              </div>
              <Button onClick={handleExportStockExcel} variant="outline" className="gap-2 h-9 text-xs">
                <FileSpreadsheet className="h-4 w-4 text-secondary" />
                Exportar Existencias a Excel
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingInventory ? (
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
                      <TableHead className="font-semibold">Artículo</TableHead>
                      <TableHead className="font-semibold">Categoría</TableHead>
                      <TableHead className="font-semibold">Stock Actual</TableHead>
                      <TableHead className="font-semibold">Costo Unit.</TableHead>
                      <TableHead className="font-semibold">Valor Costo Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => {
                      const cost = item.cost_price || 0
                      const totalVal = item.stock_qty * cost

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-text-base dark:text-white">{item.description}</TableCell>
                          <TableCell>{item.category?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              item.stock_qty === 0 ? 'bg-danger/15 text-danger' : 'bg-secondary/15 text-secondary'
                            }`}>
                              {item.stock_qty} uds
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Proyecciones */}
        <TabsContent value="proyeccion" className="space-y-6">
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
              {isLoadingMovements ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getProjectionData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 9 }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 9 }} />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="Ventas" stroke="#9B7DB6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Proyección" stroke="#F4A97F" strokeWidth={2} strokeDasharray="5 5" dot={true} />
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
