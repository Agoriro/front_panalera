import { z } from 'zod'

export const sizeSchema = z.object({
  name: z.string().min(1, 'El nombre de la talla/medida es obligatorio'),
})

export type SizeInput = z.infer<typeof sizeSchema>

