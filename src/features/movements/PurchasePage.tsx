import React, { useState } from 'react'
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
import { Skeleton } from '../../components/ui/skeleton'
import { Loader2, Plus, ShoppingBag, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, handleApiError } from '../../lib/utils'
import { toast } from 'sonner'

// Zod Validation Schema
const purchaseSchema = z.object({
  id_inventory: z.string().uuid('Debes seleccionar un artículo del inventario'),
  id_supplier: z.string().uuid('Debes seleccionar un proveedor'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser de al menos 1 unidad'),
  value: z.coerce.number().min(1, 'El costo unitario de compra debe ser mayor a 0'),
})

type PurchaseInput = z.infer<typeof purchaseSchema>

export const PurchasePage: React.FC = () => {
  const {
    movements,
    isLoadingMovements,
    inventory,
    suppliers,
    createMovement,
    isRegistering,
  } = useMovements()

  // react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PurchaseInput>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      id_inventory: '',
      id_supplier: '',
      quantity: 1,
      value: 0,
    },
  })

  // Watch fields for dynamic price calculation
  const watchedInventoryId = watch('id_inventory')
  const watchedValue = watch('value') || 0

  const selectedProduct = inventory.find((i) => i.id === watchedInventoryId)
  const utilityPercent = selectedProduct ? selectedProduct.utility : 0
  const calculatedSalePrice = watchedValue * (1 + utilityPercent / 100)

  // Filter movements for BUY purchases only
  const purchaseMovements = movements
    .filter((m) => m.type_movement === 'BUY')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const onSubmit = async (data: PurchaseInput) => {
    try {
      await createMovement({
        id_inventory: data.id_inventory,
        type_movement: 'BUY',
        id_supplier: data.id_supplier,
        quantity: data.quantity,
        value: data.value,
      })
      toast.success('Compra registrada y stock actualizado')
      reset({
        id_inventory: '',
        id_supplier: '',
        quantity: 1,
        value: 0,
      })
    } catch (e) {
      handleApiError(e)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
          Registro de Compras (Entradas)
        </h1>
        <p className="text-sm text-text-muted">
          Registra ingresos de mercadería, costos y actualiza el stock físico de tus productos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <Card className="lg:col-span-1 border-border-soft dark:border-border-soft bg-surface-card dark:bg-card h-fit">
          <CardHeader>
            <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Nueva Compra
            </CardTitle>
            <CardDescription>Completa los datos de la factura de compra.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Product */}
              <div className="space-y-2">
                <Label htmlFor="id_inventory">Artículo</Label>
                <Select
                  value={watchedInventoryId}
                  onValueChange={(val) => {
                    setValue('id_inventory', val, { shouldValidate: true })
                    // Auto-fill default supplier if associated
                    const prod = inventory.find((i) => i.id === val)
                    if (prod?.id_supplier) {
                      setValue('id_supplier', prod.id_supplier, { shouldValidate: true })
                    }
                  }}
                  disabled={isRegistering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un artículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.code_inventory ? `[${item.code_inventory}] ` : ''}{item.description} ({item.size?.name || 'S/T'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_inventory && (
                  <p className="text-xs text-danger font-medium">{errors.id_inventory.message}</p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="id_supplier">Proveedor</Label>
                <Select
                  value={watch('id_supplier')}
                  onValueChange={(val) => setValue('id_supplier', val, { shouldValidate: true })}
                  disabled={isRegistering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name_supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_supplier && (
                  <p className="text-xs text-danger font-medium">{errors.id_supplier.message}</p>
                )}
              </div>

              {/* Quantity and Unit Value Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    disabled={isRegistering}
                    {...register('quantity')}
                  />
                  {errors.quantity && (
                    <p className="text-xs text-danger font-medium">{errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Costo Unitario ($)</Label>
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

              {/* Real-time Sale Price Preview */}
              {watchedInventoryId && watchedValue > 0 && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    <span>Precio Venta Estimado</span>
                  </div>
                  <div className="font-mono text-2xl font-bold text-text-base dark:text-white leading-none">
                    {formatCurrency(calculatedSalePrice)}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Costo: {formatCurrency(watchedValue)} + Utilidad: {utilityPercent}%
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-6 pt-0">
              <Button type="submit" disabled={isRegistering} className="w-full font-display font-medium text-sm">
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Compra
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* History table panel */}
        <Card className="lg:col-span-2 border-border-soft dark:border-border-soft bg-surface-card dark:bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg font-semibold">Historial de Compras</CardTitle>
            <CardDescription>Registro histórico de facturas y mercancías ingresadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMovements ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : purchaseMovements.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                No se han registrado compras todavía.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-display font-semibold">Artículo</TableHead>
                      <TableHead className="font-display font-semibold">Proveedor</TableHead>
                      <TableHead className="font-display font-semibold">Fecha</TableHead>
                      <TableHead className="font-display font-semibold">Cant.</TableHead>
                      <TableHead className="font-display font-semibold">Costo Unit.</TableHead>
                      <TableHead className="font-display font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseMovements.map((move) => {
                      const totalCost = move.quantity * move.value
                      return (
                        <TableRow key={move.id}>
                          <TableCell className="font-medium text-text-base dark:text-white max-w-[150px] truncate">
                            {move.inventory?.description || 'Artículo N/A'}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            {move.supplier?.name_supplier || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(move.created_at)}</TableCell>
                          <TableCell>{move.quantity} uds</TableCell>
                          <TableCell className="font-mono text-xs">{formatCurrency(move.value)}</TableCell>
                          <TableCell className="font-mono font-semibold">{formatCurrency(totalCost)}</TableCell>
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

export default PurchasePage
