import { useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { CATALOG_KEYS, getSuppliersApi } from '../../api/catalog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { SearchableSelect } from '../../components/ui/searchable-select'
import { formatCurrency, formatDate, handleApiError } from '../../lib/utils'
import type { Movement } from '../../types/movement'
import { useUpdateMovement } from './useMovements'

export function EditMovementButton({ movement, onUpdated }: {
  movement: Movement
  onUpdated?: (movement: Movement) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [value, setValue] = useState('')
  const [supplier, setSupplier] = useState('')
  const [error, setError] = useState('')
  const update = useUpdateMovement()
  const isPurchase = movement.type_movement === 'BUY'
  const { data: suppliers = [] } = useQuery({
    queryKey: CATALOG_KEYS.suppliers,
    queryFn: getSuppliersApi,
    enabled: open && isPurchase,
  })
  const supplierOptions = suppliers.filter((item) => item.is_active || item.id === movement.id_supplier)
    .map((item) => ({ value: item.id, label: item.name_supplier }))
  if (movement.id_supplier && !supplierOptions.some((item) => item.value === movement.id_supplier)) {
    supplierOptions.push({ value: movement.id_supplier, label: movement.supplier?.name_supplier || 'Proveedor original' })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (update.isPending) return
      setOpen(next)
      if (next) {
        setQuantity(String(movement.quantity))
        setValue(String(movement.value))
        setSupplier(movement.id_supplier || '')
        setError('')
      }
    }}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" className="min-h-11" />}>
        <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
      </DialogTrigger>
      <DialogContent showCloseButton={!update.isPending} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar {isPurchase ? 'compra' : 'venta'}</DialogTitle>
          <DialogDescription>{movement.inventory?.description || 'Artículo'} · {formatDate(movement.created_at)}. Se conservan el artículo y la fecha originales.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={async (event) => {
          event.preventDefault()
          event.stopPropagation()
          if (update.isPending) return
          const parsedQuantity = Number(quantity)
          const parsedValue = Number(value)
          if (!Number.isSafeInteger(parsedQuantity) || parsedQuantity < 1 || !Number.isFinite(parsedValue) || parsedValue <= 0 || (isPurchase && !supplier)) {
            setError('Ingresa una cantidad entera y un valor mayores a cero, y selecciona el proveedor si es una compra.')
            return
          }
          setError('')
          try {
            const updated = await update.mutateAsync({ id: movement.id, body: {
              quantity: parsedQuantity, value: parsedValue,
              ...(isPurchase ? { id_supplier: supplier } : {}),
            } })
            onUpdated?.({ ...updated, inventory: movement.inventory, supplier: suppliers.find((item) => item.id === updated.id_supplier) || movement.supplier })
            toast.success(`${isPurchase ? 'Compra' : 'Venta'} actualizada`)
            setOpen(false)
          } catch (error) {
            handleApiError(error)
            setError('No se guardaron los cambios. Revisa el mensaje de error e inténtalo de nuevo.')
          }
        }}>
          {isPurchase && <div className="space-y-2">
            <Label htmlFor={`${id}-supplier`}>Proveedor</Label>
            <SearchableSelect id={`${id}-supplier`} value={supplier} onValueChange={setSupplier} options={supplierOptions} placeholder="Selecciona un proveedor" disabled={update.isPending} />
          </div>}
          <div className="space-y-2">
            <Label htmlFor={`${id}-quantity`}>Cantidad</Label>
            <Input id={`${id}-quantity`} type="number" min="1" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={update.isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-value`}>{isPurchase ? 'Costo unitario' : 'Precio unitario'} ($)</Label>
            <Input id={`${id}-value`} type="number" min="0.000001" step="any" required value={value} onChange={(event) => setValue(event.target.value)} disabled={update.isPending} />
          </div>
          <p className="font-medium">Total: {formatCurrency((Number(quantity) || 0) * (Number(value) || 0))}</p>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={update.isPending} onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {update.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
