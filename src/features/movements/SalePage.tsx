import React, { useState, useEffect } from 'react'
import { useMovements } from './useMovements'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Loader2, Plus, ShoppingCart, Info, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, handleApiError } from '../../lib/utils'
import { toast } from 'sonner'

// Zod Validation Schema
const saleSchema = z.object({
  id_inventory: z.string().uuid('Debes seleccionar un artículo del inventario'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser de al menos 1 unidad'),
  value: z.coerce.number().min(1, 'El precio de venta debe ser mayor a 0'),
})

type SaleInput = z.infer<typeof saleSchema>

export const SalePage: React.FC = () => {
  const {
    movements,
    isLoadingMovements,
    inventory,
    createMovement,
    isRegistering,
  } = useMovements()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      id_inventory: '',
      quantity: 1,
      value: 0,
    },
  })

  const watchedInventoryId = watch('id_inventory')
  const selectedProduct = inventory.find((i) => i.id === watchedInventoryId)

  // Auto-fill price when product changes
  useEffect(() => {
    if (selectedProduct) {
      const cost = selectedProduct.cost_price || 0
      const defaultSalePrice = cost * (1 + selectedProduct.utility / 100)
      setValue('value', Math.round(defaultSalePrice))
    }
  }, [selectedProduct, setValue])

  // Filter today's sales movements
  const todaySales = movements
    .filter((m) => {
      if (m.type_movement !== 'SELL') return false
      const mDate = new Date(m.created_at).toDateString()
      const todayDate = new Date().toDateString()
      return mDate === todayDate
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const onSubmit = async (data: SaleInput) => {
    if (selectedProduct && selectedProduct.stock_qty < data.quantity) {
      toast.warning(`Stock insuficiente. Solo hay ${selectedProduct.stock_qty} unidades disponibles.`)
      return
    }

    try {
      await createMovement({
        id_inventory: data.id_inventory,
        type_movement: 'SELL',
        id_supplier: null, // Supplier must be null for sales
        quantity: data.quantity,
        value: data.value,
      })
      toast.success('Venta registrada con éxito')
      reset({
        id_inventory: '',
        quantity: 1,
        value: 0,
      })
    } catch (e) {
      handleApiError(e)
    }
  }

  // Stock indicator styles
  const getStockIndicator = () => {
    if (!selectedProduct) return null
    const stock = selectedProduct.stock_qty
    if (stock === 0) {
      return (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
          <AlertTriangle className="h-4 w-4" />
          <span>¡Agotado! No se pueden registrar ventas.</span>
        </div>
      )
    }
    if (stock < 5) {
      return (
        <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3 text-xs text-accent font-medium">
          <Info className="h-4 w-4" />
          <span>Stock crítico: Solo quedan {stock} unidades disponibles.</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 rounded-lg bg-secondary/10 border border-secondary/20 p-3 text-xs text-secondary font-medium">
        <Info className="h-4 w-4" />
        <span>Disponibles en almacén: {stock} unidades.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
          Registro de Ventas (Salidas)
        </h1>
        <p className="text-sm text-text-muted">
          Registra salidas de productos a clientes y genera comprobantes de venta diarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <Card className="lg:col-span-1 border-border-soft dark:border-border-soft bg-surface-card dark:bg-card h-fit">
          <CardHeader>
            <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              Nueva Venta
            </CardTitle>
            <CardDescription>Selecciona el producto y registra el valor cobrado.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Product selector */}
              <div className="space-y-2">
                <Label htmlFor="id_inventory">Artículo</Label>
                <Select
                  value={watchedInventoryId}
                  onValueChange={(val) => setValue('id_inventory', val, { shouldValidate: true })}
                  disabled={isRegistering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un artículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id} disabled={item.stock_qty === 0}>
                        {item.code_inventory ? `[${item.code_inventory}] ` : ''}{item.description} ({item.size?.name || 'S/T'}) - Stock: {item.stock_qty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_inventory && (
                  <p className="text-xs text-danger font-medium">{errors.id_inventory.message}</p>
                )}
              </div>

              {/* Stock Warning Box */}
              {selectedProduct && getStockIndicator()}

              {/* Quantity and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    disabled={isRegistering || (selectedProduct?.stock_qty === 0)}
                    {...register('quantity')}
                  />
                  {errors.quantity && (
                    <p className="text-xs text-danger font-medium">{errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Precio Cobrado ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    disabled={isRegistering}
                    {...register('value')}
                  />
                  {errors.value && (
                    <p className="text-xs text-danger font-medium">{errors.value.message}</p>
                  )}
                </div>
              </div>

              {/* Sale Summary Preview */}
              {watchedInventoryId && watch('quantity') > 0 && watch('value') > 0 && (
                <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-4 space-y-1 animate-fade-in">
                  <div className="text-xs text-secondary font-semibold">Total a Cobrar</div>
                  <div className="font-mono text-2xl font-bold text-text-base dark:text-white leading-none">
                    {formatCurrency(watch('quantity') * watch('value'))}
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                type="submit"
                disabled={isRegistering || !selectedProduct || selectedProduct.stock_qty === 0}
                className="w-full font-display font-medium text-sm bg-secondary hover:bg-secondary/90 text-white"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Venta
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* History Table */}
        <Card className="lg:col-span-2 border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg font-semibold">Ventas del Día</CardTitle>
            <CardDescription>Resumen de transacciones realizadas hoy.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMovements ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : todaySales.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                No se han registrado ventas hoy.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-display font-semibold">Artículo</TableHead>
                      <TableHead className="font-display font-semibold">Hora</TableHead>
                      <TableHead className="font-display font-semibold">Cantidad</TableHead>
                      <TableHead className="font-display font-semibold">Precio Unit.</TableHead>
                      <TableHead className="font-display font-semibold">Total Venta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaySales.map((move) => {
                      const totalSale = move.quantity * move.value
                      return (
                        <TableRow key={move.id}>
                          <TableCell className="font-medium text-text-base dark:text-white max-w-[180px] truncate">
                            {move.inventory?.description || 'Artículo N/A'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(move.created_at).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>{move.quantity} uds</TableCell>
                          <TableCell className="font-mono text-xs">{formatCurrency(move.value)}</TableCell>
                          <TableCell className="font-mono font-semibold text-secondary">{formatCurrency(totalSale)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SalePage
