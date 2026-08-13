import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre de la categoría debe tener al menos 2 caracteres'),
  is_active: z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>
