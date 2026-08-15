import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { colorSchema, ColorInput } from './schema'
import { Color } from '../../../types/catalog'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Loader2, Pipette } from 'lucide-react'

interface ColorFormProps {
  color?: Color | null
  onSubmit: (data: ColorInput) => void
  isSubmitting: boolean
}

const PRESET_COLORS = [
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Negro', hex: '#1E293B' },
  { name: 'Rosa Pastel', hex: '#F472B6' },
  { name: 'Azul Cielo', hex: '#60A5FA' },
  { name: 'Lila', hex: '#A855F7' },
  { name: 'Verde Menta', hex: '#4ADE80' },
  { name: 'Amarillo', hex: '#FACC15' },
  { name: 'Beige', hex: '#E2D4C9' },
  { name: 'Gris', hex: '#94A3B8' },
  { name: 'Rojo', hex: '#EF4444' },
]

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
      hex_value: '#9B7DB6',
    },
  })

  useEffect(() => {
    if (color) {
      reset({
        name: color.name || (color as any).name_color || '',
        hex_value: color.hex_value || (color as any).hex_color || '#9B7DB6',
      })
    } else {
      reset({
        name: '',
        hex_value: '#9B7DB6',
      })
    }
  }, [color, reset])

  const hexValue = watch('hex_value')
  const currentName = watch('name')
  const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hexValue || '')
  const safeHexForPicker = isValidHex && hexValue?.length === 7 ? hexValue : '#9B7DB6'

  const colorInputRef = React.useRef<HTMLInputElement>(null)

  const handleOpenPicker = () => {
    if (colorInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          colorInputRef.current.showPicker()
          return
        } catch {
          // Fallback to click if showPicker fails
        }
      }
      colorInputRef.current.click()
    }
  }

  const handleSelectPreset = (preset: { name: string; hex: string }) => {
    setValue('hex_value', preset.hex, { shouldValidate: true })
    if (!currentName || PRESET_COLORS.some((p) => p.name === currentName)) {
      setValue('name', preset.name, { shouldValidate: true })
    }
  }

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

        {/* Hex Value & Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="hex_value">Código de Color</Label>
          <div className="flex gap-3 items-center">
            <Input
              id="hex_value"
              placeholder="#9B7DB6"
              {...register('hex_value')}
              disabled={isSubmitting}
              className="flex-1 font-mono uppercase"
            />
            
            {/* Interactive Color Picker Button */}
            <button
              type="button"
              onClick={handleOpenPicker}
              disabled={isSubmitting}
              className="relative h-10 w-14 shrink-0 rounded-lg border-2 border-border-soft overflow-hidden shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: isValidHex ? hexValue : '#9B7DB6' }}
              title="Click para abrir selector de color"
            >
              <input
                ref={colorInputRef}
                type="color"
                value={safeHexForPicker}
                onChange={(e) => setValue('hex_value', e.target.value.toUpperCase(), { shouldValidate: true })}
                disabled={isSubmitting}
                className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
                tabIndex={-1}
              />
              <Pipette className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none" />
            </button>
          </div>
          {errors.hex_value && (
            <p className="text-xs text-danger font-medium">{errors.hex_value.message}</p>
          )}

          {/* Quick presets */}
          <div className="pt-2">
            <span className="text-xs text-text-muted font-medium mb-1.5 block">Colores rápidos:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="h-6 w-6 rounded-md border border-border-soft shadow-xs transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: preset.hex }}
                  title={`${preset.name} (${preset.hex})`}
                />
              ))}
            </div>
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
