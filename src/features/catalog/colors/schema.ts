import { z } from 'zod'

export const colorSchema = z.object({
  name: z.string().min(2, 'El nombre del color debe tener al menos 2 caracteres'),
})

export type ColorInput = z.infer<typeof colorSchema>


