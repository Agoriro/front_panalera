import { z } from 'zod'

export const inventorySchema = z.object({
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  code_inventory: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  barcode_inventory: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  utility: z.coerce.number().min(0, 'El porcentaje de utilidad debe ser mayor o igual a 0').max(500, 'El porcentaje de utilidad no debe exceder el 500%'),
  id_supplier: z.string().uuid('Debes seleccionar un proveedor válido'),
  id_category: z.string().uuid('Debes seleccionar una categoría válida'),
  id_color: z.string().uuid('Debes seleccionar un color válido'),
  id_size: z.string().uuid('Debes seleccionar una talla válida'),
  id_gender: z.string().uuid('Debes seleccionar un género válido'),
  photo_url: z.string().nullable().optional(),
})

export type InventoryInput = z.infer<typeof inventorySchema>
