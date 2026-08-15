import { z } from 'zod'

export const genderSchema = z.object({
  name: z.string().min(1, 'El nombre del género es obligatorio (ej. Niño, Niña, Unisex)'),
})

export type GenderInput = z.infer<typeof genderSchema>

