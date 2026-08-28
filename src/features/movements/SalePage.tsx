import React, { useState } from 'react'
import { useMovements } from './useMovements'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { SearchableSelect } from '../../components/ui/searchable-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Info, Loader2, Plus, ShoppingCart } from 'lucide-react'
import { formatCurrency, formatDate, handleApiError } from '../../lib/utils'
import { toast } from 'sonner'
import { Skeleton } from '../../components/ui/skeleton'
import { useDebounce } from '../../hooks/useDebounce'

// Zod Validation Schema
const saleSchema = z.object({
  id_inventory: z.string().uuid('Debes seleccionar un artículo del inventario'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser de al menos 1 unidad'),
  value: z.coerce.number().positive('El precio de venta debe ser mayor a 0'),
})

type SaleInput = z.infer<typeof saleSchema>
type SaleSortKey = 'article' | 'date' | 'quantity' | 'unitPrice' | 'total'
type SortDirection = 'asc' | 'desc'

export const SalePage: React.FC = () => {
  const [inventorySearch, setInventorySearch] = useState('')
  const [sort, setSort] = useState<{ key: SaleSortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  })
  const debouncedInventorySearch = useDebounce(inventorySearch, 300)
  const {
    movements,
    isLoadingMovements,
    inventory,
    createSale,
    isRegistering,
  } = useMovements(debouncedInventorySearch)

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
  const watchedQuantity = watch('quantity') || 0
  const selectedProduct = inventory.find((i) => i.id === watchedInventoryId)
  const suggestedPrice = selectedProduct
    ? Math.round((selectedProduct.cost_price || 0) * (1 + selectedProduct.utility / 100))
    : 0
  const watchedValue = watch('value') || 0
  const isBelowSuggested = Boolean(selectedProduct && suggestedPrice > 0 && watchedValue < suggestedPrice)

  // Filter today's sales movements
  const todaySales = movements
    .filter((m) => {
      if (m.type_movement !== 'SELL') return false
      const mDate = new Date(m.created_at).toDateString()
      const todayDate = new Date().toDateString()
      return mDate === todayDate
    })
    .sort((a, b) => {
      const values: Record<SaleSortKey, [string | number, string | number]> = {
        article: [a.inventory?.description || '', b.inventory?.description || ''],
        date: [new Date(a.created_at).getTime(), new Date(b.created_at).getTime()],
        quantity: [a.quantity, b.quantity],
        unitPrice: [Number(a.value), Number(b.value)],
        total: [a.quantity * Number(a.value), b.quantity * Number(b.value)],
      }
      const [left, right] = values[sort.key]
      const comparison = typeof left === 'string'
        ? left.localeCompare(String(right), 'es', { sensitivity: 'base' })
        : left - Number(right)
      return sort.direction === 'asc' ? comparison : -comparison
    })

  const changeSort = (key: SaleSortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortableHeader = ({ column, children }: { column: SaleSortKey; children: React.ReactNode }) => {
    const Icon = sort.key !== column ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown
    return (
      <button
        type="button"
        onClick={() => changeSort(column)}
        className="flex w-full items-center gap-1.5 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={`Ordenar por ${String(children)}`}
      >
        <span>{children}</span>
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>
    )
  }

  const onSubmit = async (data: SaleInput) => {
    if (selectedProduct && selectedProduct.stock_qty < data.quantity) {
      toast.warning(`Stock insuficiente. Solo hay ${selectedProduct.stock_qty} unidades disponibles.`)
      return
    }

    if (data.value < suggestedPrice) {
      toast.error(`El precio no puede ser inferior al sugerido (${formatCurrency(suggestedPrice)}).`)
      return
    }

    try {
      await createSale({
        id_inventory: data.id_inventory,
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
            <CardDescription>Selecciona el producto y ajusta el precio sin bajar del valor sugerido.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Product selector */}
              <div className="space-y-2">
                <Label htmlFor="id_inventory">Artículo</Label>
                <SearchableSelect
                  id="id_inventory"
                  value={watchedInventoryId}
                  onValueChange={(val) => {
                    const product = inventory.find((item) => item.id === val)
                    const minimumPrice = product
                      ? Math.round((product.cost_price || 0) * (1 + product.utility / 100))
                      : 0
                    setValue('id_inventory', val, { shouldValidate: true })
                    setValue('value', minimumPrice, { shouldValidate: true })
                  }}
                  onSearchChange={setInventorySearch}
                  options={inventory.map((item) => ({
                    value: item.id,
                    label: `${item.code_inventory ? `[${item.code_inventory}] ` : ''}${item.description} · ${item.stock_qty} uds`,
                    keywords: item.barcode_inventory || '',
                  }))}
                  placeholder="Busca por código, descripción o código de barras"
                  searchPlaceholder="Código, descripción o código de barras..."
                  emptyMessage="No se encontraron artículos."
                  disabled={isRegistering}
                />
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
                  <Label htmlFor="value">Precio de venta ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    min={suggestedPrice || 1}
                    step="1"
                    disabled={isRegistering || !selectedProduct}
                    aria-invalid={isBelowSuggested || Boolean(errors.value)}
                    className="font-mono"
                    {...register('value')}
                  />
                  {errors.value && <p className="text-xs font-medium text-danger">{errors.value.message}</p>}
                  {!errors.value && isBelowSuggested && (
                    <p className="text-xs font-medium text-danger">
                      Mínimo permitido: {formatCurrency(suggestedPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Sale Summary Preview */}
              {watchedInventoryId && watchedQuantity > 0 && watchedValue > 0 && (
                <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-4 space-y-1 animate-fade-in">
                  <div className="text-xs text-secondary font-semibold">Total a Cobrar</div>
                  <div className="font-mono text-2xl font-bold text-text-base dark:text-white leading-none">
                    {formatCurrency(watchedQuantity * watchedValue)}
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                type="submit"
                disabled={isRegistering || !selectedProduct || selectedProduct.stock_qty === 0 || isBelowSuggested}
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
                      <TableHead className="font-display font-semibold"><SortableHeader column="article">Artículo</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="date">Fecha y hora</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="quantity">Cantidad</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="unitPrice">Precio Unit.</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="total">Total Venta</SortableHeader></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaySales.map((move) => {
                      const unitPrice = Number(move.value)
                      const totalSale = move.quantity * unitPrice
                      return (
                        <TableRow key={move.id}>
                          <TableCell className="font-medium text-text-base dark:text-white max-w-[180px] truncate">
                            {move.inventory?.description || 'Artículo N/A'}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{formatDate(move.created_at)}</TableCell>
                          <TableCell>{move.quantity} uds</TableCell>
                          <TableCell className="font-mono text-xs">{formatCurrency(unitPrice)}</TableCell>
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
