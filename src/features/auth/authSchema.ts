import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
