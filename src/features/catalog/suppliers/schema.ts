import { z } from 'zod'

export const supplierSchema = z.object({
  name_supplier: z.string().min(2, 'El nombre del proveedor debe tener al menos 2 caracteres'),
  address: z.string().min(2, 'La dirección debe tener al menos 2 caracteres'),
  is_active: z.boolean().default(true),
})

export type SupplierInput = z.infer<typeof supplierSchema>
