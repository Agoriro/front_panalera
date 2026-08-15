import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { genderSchema, GenderInput } from './schema'
import { Gender } from '../../../types/catalog'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Loader2 } from 'lucide-react'

interface GenderFormProps {
  gender?: Gender | null
  onSubmit: (data: GenderInput) => void
  isSubmitting: boolean
}

export const GenderForm: React.FC<GenderFormProps> = ({
  gender,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenderInput>({
    resolver: zodResolver(genderSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (gender) {
      reset({
        name: gender.name || (gender as any).name_gender || '',
      })
    } else {
      reset({
        name: '',
      })
    }
  }, [gender, reset])

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {gender ? 'Editar Género' : 'Nuevo Género'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Género</Label>
          <Input
            id="name"
            placeholder="Niño / Niña / Unisex"
            {...register('name')}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-danger font-medium">{errors.name.message}</p>
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

export default GenderForm
