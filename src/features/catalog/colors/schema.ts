import { z } from 'zod'

export const colorSchema = z.object({
  name: z.string().min(2, 'El nombre del color debe tener al menos 2 caracteres'),
  hex_value: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Debe ser un código hexadecimal válido (ej. #FFFFFF)').or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type ColorInput = z.infer<typeof colorSchema>
