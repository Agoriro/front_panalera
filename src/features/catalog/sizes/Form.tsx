import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sizeSchema, SizeInput } from './schema'
import { Size } from '../../../types/catalog'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Loader2 } from 'lucide-react'

interface SizeFormProps {
  size?: Size | null
  onSubmit: (data: SizeInput) => void
  isSubmitting: boolean
}

export const SizeForm: React.FC<SizeFormProps> = ({
  size,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SizeInput>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (size) {
      reset({
        name: size.name,
        is_active: size.is_active,
      })
    } else {
      reset({
        name: '',
        is_active: true,
      })
    }
  }, [size, reset])

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {size ? 'Editar Talla' : 'Nueva Talla'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Talla / Etapa</Label>
          <Input
            id="name"
            placeholder="Etapa 1 / Talla M"
            {...register('name')}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-danger font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center space-x-3 space-y-0 rounded-md border border-border-soft p-4 dark:border-border-soft">
          <input
            id="is_active"
            type="checkbox"
            className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
            {...register('is_active')}
            disabled={isSubmitting}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="is_active" className="cursor-pointer font-medium">
              Talla Activa
            </Label>
            <p className="text-xs text-text-muted">
              Si está inactiva, no podrá ser seleccionada para nuevos artículos.
            </p>
          </div>
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

export default SizeForm
