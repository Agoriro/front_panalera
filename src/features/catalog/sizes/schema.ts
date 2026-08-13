import { z } from 'zod'

export const sizeSchema = z.object({
  name: z.string().min(1, 'El nombre de la talla/medida es obligatorio'),
  is_active: z.boolean().default(true),
})

export type SizeInput = z.infer<typeof sizeSchema>
