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
import { Skeleton } from '../../components/ui/skeleton'
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Plus, ShoppingBag, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, handleApiError } from '../../lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '../../hooks/useDebounce'
import type { Movement } from '../../types/movement'

// Zod Validation Schema
const purchaseSchema = z.object({
  id_inventory: z.string().uuid('Debes seleccionar un artículo del inventario'),
  id_supplier: z.string().uuid('Debes seleccionar un proveedor'),
  quantity: z.coerce.number().int().min(1, 'La cantidad debe ser de al menos 1 unidad'),
  value: z.coerce.number().min(1, 'El costo unitario de compra debe ser mayor a 0'),
})

type PurchaseInput = z.infer<typeof purchaseSchema>
type PurchaseSortKey = 'article' | 'supplier' | 'date' | 'quantity' | 'unitCost' | 'total'
type SortDirection = 'asc' | 'desc'

export const PurchasePage: React.FC = () => {
  const [inventorySearch, setInventorySearch] = useState('')
  const [registeredPurchases, setRegisteredPurchases] = useState<Movement[]>([])
  const [sort, setSort] = useState<{ key: PurchaseSortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  })
  const debouncedInventorySearch = useDebounce(inventorySearch, 300)
  const {
    movements,
    isLoadingMovements,
    inventory,
    suppliers,
    createPurchase,
    isRegistering,
  } = useMovements(debouncedInventorySearch)

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
  const movementById = new Map<string, Movement>()
  movements.forEach((movement) => movementById.set(movement.id, movement))
  registeredPurchases.forEach((movement) => movementById.set(movement.id, movement))

  const purchaseMovements = Array.from(movementById.values())
    .filter((movement) => movement.type_movement === 'BUY')
    .sort((a, b) => {
      const values: Record<PurchaseSortKey, [string | number, string | number]> = {
        article: [a.inventory?.description || '', b.inventory?.description || ''],
        supplier: [a.supplier?.name_supplier || '', b.supplier?.name_supplier || ''],
        date: [new Date(a.created_at).getTime(), new Date(b.created_at).getTime()],
        quantity: [a.quantity, b.quantity],
        unitCost: [Number(a.value), Number(b.value)],
        total: [a.quantity * Number(a.value), b.quantity * Number(b.value)],
      }
      const [left, right] = values[sort.key]
      const comparison = typeof left === 'string'
        ? left.localeCompare(String(right), 'es', { sensitivity: 'base' })
        : left - Number(right)
      return sort.direction === 'asc' ? comparison : -comparison
    })

  const changeSort = (key: PurchaseSortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortableHeader = ({ column, children }: { column: PurchaseSortKey; children: React.ReactNode }) => {
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

  const onSubmit = async (data: PurchaseInput) => {
    try {
      const createdPurchase = await createPurchase({
        id_inventory: data.id_inventory,
        id_supplier: data.id_supplier,
        quantity: data.quantity,
        value: data.value,
      })
      setRegisteredPurchases((current) => [{
        ...createdPurchase,
        type_movement: 'BUY',
        inventory: inventory.find((item) => item.id === data.id_inventory),
        supplier: suppliers.find((supplier) => supplier.id === data.id_supplier),
      }, ...current.filter((movement) => movement.id !== createdPurchase.id)])
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
                <SearchableSelect
                  id="id_inventory"
                  value={watchedInventoryId}
                  onSearchChange={setInventorySearch}
                  onValueChange={(val) => {
                    setValue('id_inventory', val, { shouldValidate: true })
                    // Auto-fill default supplier if associated
                    const prod = inventory.find((i) => i.id === val)
                    if (prod?.id_supplier) {
                      setValue('id_supplier', prod.id_supplier, { shouldValidate: true })
                    }
                  }}
                  options={inventory.map((item) => ({
                    value: item.id,
                    label: `${item.code_inventory ? `[${item.code_inventory}] ` : ''}${item.description}`,
                    keywords: item.barcode_inventory || '',
                  }))}
                  placeholder="Busca por código, descripción o código de barras"
                  searchPlaceholder="Código, descripción o código de barras..."
                  emptyMessage="No se encontraron artículos."
                  disabled={isRegistering}
                />
                {selectedProduct && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                    <p className="font-semibold text-text-base dark:text-white">
                      {selectedProduct.code_inventory || 'Sin código'} · {selectedProduct.description}
                    </p>
                    <p className="mt-1 text-text-muted">
                      Proveedor: {selectedProduct.supplier?.name_supplier || 'Sin proveedor asociado'}
                    </p>
                  </div>
                )}
                {errors.id_inventory && (
                  <p className="text-xs text-danger font-medium">{errors.id_inventory.message}</p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="id_supplier">Proveedor</Label>
                <SearchableSelect
                  id="id_supplier"
                  value={watch('id_supplier')}
                  onValueChange={(val) => setValue('id_supplier', val, { shouldValidate: true })}
                  options={suppliers.map((supplier) => ({
                    value: supplier.id,
                    label: supplier.name_supplier,
                  }))}
                  placeholder="Selecciona un proveedor"
                  searchPlaceholder="Buscar proveedor..."
                  emptyMessage="No se encontraron proveedores."
                  disabled={isRegistering}
                />
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
                      <TableHead className="font-display font-semibold"><SortableHeader column="article">Artículo</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="supplier">Proveedor</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="date">Fecha</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="quantity">Cant.</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="unitCost">Costo Unit.</SortableHeader></TableHead>
                      <TableHead className="font-display font-semibold"><SortableHeader column="total">Total</SortableHeader></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseMovements.map((move) => {
                      const totalCost = move.quantity * Number(move.value)
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
                          <TableCell className="font-mono text-xs">{formatCurrency(Number(move.value))}</TableCell>
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
