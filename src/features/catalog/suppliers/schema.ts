import { z } from 'zod'

export const supplierSchema = z.object({
  name_supplier: z.string().min(2, 'El nombre del proveedor debe tener al menos 2 caracteres'),
  address: z.string().optional().nullable().or(z.literal('')),
})

export type SupplierInput = z.infer<typeof supplierSchema>

