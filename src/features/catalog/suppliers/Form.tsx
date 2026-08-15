import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, SupplierInput } from './schema'
import { Supplier } from '../../../types/catalog'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Loader2 } from 'lucide-react'

interface SupplierFormProps {
  supplier?: Supplier | null // If editing
  onSubmit: (data: SupplierInput) => void
  isSubmitting: boolean
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  supplier,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name_supplier: '',
      address: '',
    },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name_supplier: supplier.name_supplier || (supplier as any).name || '',
        address: supplier.address || '',
      })
    } else {
      reset({
        name_supplier: '',
        address: '',
      })
    }
  }, [supplier, reset])

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* Name Supplier */}
        <div className="space-y-2">
          <Label htmlFor="name_supplier">Nombre del Proveedor</Label>
          <Input
            id="name_supplier"
            placeholder="Distribuidora Infantil S.A."
            {...register('name_supplier')}
            disabled={isSubmitting}
          />
          {errors.name_supplier && (
            <p className="text-xs text-danger font-medium">{errors.name_supplier.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Calle 123 #45-67, Bogotá"
            {...register('address')}
            disabled={isSubmitting}
          />
          {errors.address && (
            <p className="text-xs text-danger font-medium">{errors.address.message}</p>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="font-display font-medium text-sm">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export default SupplierForm
