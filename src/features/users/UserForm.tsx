import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Role } from '../../types/user'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Loader2, Key } from 'lucide-react'

interface UserFormProps {
  user?: User | null
  roles: Role[]
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export const UserForm: React.FC<UserFormProps> = ({ user, roles, onSubmit, isSubmitting }) => {
  const isEdit = !!user
  const [changePassword, setChangePassword] = useState(false)

  const userFormSchema = z.object({
    user: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
    id_role: z.string().min(1, 'Debes seleccionar un rol'),
    is_active: z.boolean().default(true),
    password:
      isEdit && !changePassword
        ? z.string().optional()
        : z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
  })

  type UserFormInput = z.infer<typeof userFormSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      user: '',
      id_role: '',
      is_active: true,
      password: '',
    },
  })

  useEffect(() => {
    setChangePassword(false)
    if (user) {
      reset({
        user: user.user,
        id_role: user.id_role,
        is_active: user.is_active,
        password: '',
      })
    } else {
      reset({ user: '', id_role: '', is_active: true, password: '' })
    }
  }, [user, reset])

  const handleFormSubmit = (data: UserFormInput) => {
    const submitData = { ...data }
    if (isEdit && !changePassword) {
      delete submitData.password
    }
    onSubmit(submitData)
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="user">Nombre de Usuario</Label>
          <Input
            id="user"
            placeholder="vendedor1"
            {...register('user')}
            disabled={isSubmitting}
          />
          {errors.user && (
            <p className="text-xs text-danger font-medium">{errors.user.message}</p>
          )}
        </div>

        {/* Role Selector */}
        <div className="space-y-2">
          <Label htmlFor="id_role">Rol asignado</Label>
          <Select
            disabled={isSubmitting}
            value={watch('id_role')}
            onValueChange={(val) => setValue('id_role', val, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id_role} value={r.id_role}>
                  {r.name}
                </SelectItem>
              ))}
              {roles.length === 0 && (
                <SelectItem value="" disabled>
                  No hay roles disponibles
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.id_role && (
            <p className="text-xs text-danger font-medium">{errors.id_role.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center space-x-3 space-y-0 rounded-md border border-border-soft p-3 dark:border-border-soft">
          <input
            id="is_active"
            type="checkbox"
            className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
            {...register('is_active')}
            disabled={isSubmitting}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="is_active" className="cursor-pointer font-medium">
              Usuario Activo
            </Label>
            <p className="text-[10px] text-text-muted">
              Si está inactivo, el usuario no podrá iniciar sesión.
            </p>
          </div>
        </div>

        {/* Edit Password Toggle */}
        {isEdit && (
          <div className="flex items-center space-x-2 py-2">
            <input
              id="changePassword"
              type="checkbox"
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="changePassword" className="cursor-pointer text-xs font-semibold flex items-center gap-1.5 text-primary">
              <Key className="h-3.5 w-3.5" />
              Cambiar Contraseña
            </Label>
          </div>
        )}

        {/* Password Input */}
        {(!isEdit || changePassword) && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-danger font-medium">{errors.password.message}</p>
            )}
          </div>
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

export default UserForm
