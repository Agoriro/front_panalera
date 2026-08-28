import React, { useEffect, useState } from 'react'
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
  onSubmit: (data: SizeInput) => Promise<void>
  isSubmitting: boolean
}

export const SizeForm: React.FC<SizeFormProps> = ({
  size,
  onSubmit,
  isSubmitting,
}) => {
  const [preserveDescription, setPreserveDescription] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SizeInput>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (size) {
      reset({
        name: size.name || (size as any).name_size || '',
      })
    } else {
      reset({
        name: '',
      })
    }
  }, [size, reset])

  const submitForm = async (data: SizeInput) => {
    await onSubmit(data)
    if (!preserveDescription) reset({ name: '' })
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {size ? 'Editar Talla' : 'Nueva Talla'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4 py-4">
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

        {!size && (
          <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/35 px-3 text-sm">
            <input type="checkbox" checked={preserveDescription} onChange={(event) => setPreserveDescription(event.target.checked)} disabled={isSubmitting}
              className="h-4 w-4 rounded border-input accent-primary" />
            <span>Conservar descripción para el siguiente registro</span>
          </label>
        )}

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
