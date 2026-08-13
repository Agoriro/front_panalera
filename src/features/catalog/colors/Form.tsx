import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { colorSchema, ColorInput } from './schema'
import { Color } from '../../../types/catalog'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Loader2 } from 'lucide-react'

interface ColorFormProps {
  color?: Color | null
  onSubmit: (data: ColorInput) => void
  isSubmitting: boolean
}

export const ColorForm: React.FC<ColorFormProps> = ({
  color,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ColorInput>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: '',
      hex_value: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (color) {
      reset({
        name: color.name,
        hex_value: color.hex_value || '',
        is_active: color.is_active,
      })
    } else {
      reset({
        name: '',
        hex_value: '#9B7DB6', // Default pastel lila
        is_active: true,
      })
    }
  }, [color, reset])

  const hexValue = watch('hex_value')

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {color ? 'Editar Color' : 'Nuevo Color'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Color</Label>
          <Input
            id="name"
            placeholder="Azul Pastel"
            {...register('name')}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-danger font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Hex Value */}
        <div className="space-y-2">
          <Label htmlFor="hex_value">Código Hexadecimal</Label>
          <div className="flex gap-3">
            <Input
              id="hex_value"
              placeholder="#E5E4E7"
              {...register('hex_value')}
              disabled={isSubmitting}
              className="flex-1 font-mono"
            />
            {/* Visual Color Preview */}
            <div
              className="h-10 w-10 shrink-0 rounded-lg border border-border-soft shadow-inner transition-colors"
              style={{ backgroundColor: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hexValue) ? hexValue : '#ccc' }}
            />
          </div>
          {errors.hex_value && (
            <p className="text-xs text-danger font-medium">{errors.hex_value.message}</p>
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
              Color Activo
            </Label>
            <p className="text-xs text-text-muted">
              Si está inactivo, no podrá ser asignado a nuevos artículos.
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

export default ColorForm
