import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { CATALOG_KEYS, createCategoryApi, createColorApi, createGenderApi, createSizeApi, createSupplierApi } from '../../api/catalog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { colorSchema } from '../catalog/colors/schema'
import { sizeSchema } from '../catalog/sizes/schema'
import { supplierSchema } from '../catalog/suppliers/schema'
import { categorySchema } from '../catalog/categories/schema'
import { genderSchema } from '../catalog/genders/schema'

type Catalog = 'colors' | 'sizes' | 'suppliers' | 'categories' | 'genders'
const nameSchemas = { colors: colorSchema, sizes: sizeSchema, categories: categorySchema, genders: genderSchema }
const labels = {
  categories: { action: 'Crear categoría', title: 'Nueva categoría', name: 'Nombre de la categoría' },
  genders: { action: 'Crear género', title: 'Nuevo género', name: 'Nombre del género' },
  colors: { action: 'Crear color', title: 'Nuevo color', name: 'Nombre del color' },
  sizes: { action: 'Crear talla', title: 'Nueva talla', name: 'Nombre de la talla / etapa' },
  suppliers: { action: 'Crear proveedor', title: 'Nuevo proveedor', name: 'Nombre del proveedor' },
}

export function CreateCatalogButton({ catalog, disabled, onCreated }: {
  catalog: Catalog
  disabled: boolean
  onCreated: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const label = labels[catalog]
  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim()
      if (catalog === 'suppliers') {
        const data = supplierSchema.parse({ name_supplier: trimmedName, address: address.trim() })
        const created = await createSupplierApi({ ...data, is_active: true })
        return { ...data, ...created, id: created.id || created.id_supplier || '', name_supplier: created.name_supplier || created.name || trimmedName, is_active: true }
      }
      const data = nameSchemas[catalog].parse({ name: trimmedName })
      if (catalog === 'categories') {
        const created = await createCategoryApi({ ...data, is_active: true })
        return { ...created, id: created.id || created.id_category || '', is_active: true }
      }
      if (catalog === 'genders') {
        const created = await createGenderApi({ ...data, is_active: true })
        return { ...created, id: created.id || created.id_gender || '', is_active: true }
      }
      if (catalog === 'colors') {
        const created = await createColorApi({ ...data, is_active: true })
        return { ...created, id: created.id || created.id_color || '', is_active: true }
      }
      const created = await createSizeApi({ ...data, is_active: true })
      return { ...created, id: created.id || created.id_size || '', is_active: true }
    },
  })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (isSaving) return
      setOpen(nextOpen)
      if (nextOpen) { setName(''); setAddress(''); setError('') }
    }}>
      <DialogTrigger render={<Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0" disabled={disabled} aria-label={label.action} title={label.action} />}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent showCloseButton={!isSaving} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{label.title}</DialogTitle>
          <DialogDescription>Al guardar, estará disponible y seleccionado en el producto.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={async (event) => {
          event.preventDefault()
          // Portaled forms still bubble submit events through the React tree.
          event.stopPropagation()
          if (isSaving) return
          setError('')
          const validation = catalog === 'suppliers'
            ? supplierSchema.safeParse({ name_supplier: name.trim(), address: address.trim() })
            : nameSchemas[catalog].safeParse({ name: name.trim() })
          if (!validation.success) {
            setError(validation.error.issues[0].message)
            return
          }
          setIsSaving(true)
          try {
            const created = await mutation.mutateAsync()
            const queryKey = CATALOG_KEYS[catalog]
            await queryClient.cancelQueries({ queryKey })
            if (created.id) {
              queryClient.setQueryData<Array<{ id: string }>>(queryKey, (items = []) => [
                ...items.filter((item) => item.id !== created.id), created,
              ])
              onCreated(created.id)
            }
            await queryClient.invalidateQueries({ queryKey })
            setOpen(false)
          } catch {
            setError('No se pudo guardar. Revisa los datos e inténtalo de nuevo.')
          } finally {
            setIsSaving(false)
          }
        }}>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>{label.name}</Label>
            <Input id={`${id}-name`} autoFocus value={name} onChange={(event) => setName(event.target.value)} disabled={isSaving} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />
          </div>
          {catalog === 'suppliers' && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-address`}>Dirección (opcional)</Label>
              <Input id={`${id}-address`} value={address} onChange={(event) => setAddress(event.target.value)} disabled={isSaving} />
            </div>
          )}
          {error && <p id={`${id}-error`} role="alert" className="text-xs text-danger font-medium">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
