import { z } from 'zod'

export const genderSchema = z.object({
  name: z.string().min(1, 'El nombre del género es obligatorio (ej. Niño, Niña, Unisex)'),
  is_active: z.boolean().default(true),
})

export type GenderInput = z.infer<typeof genderSchema>
