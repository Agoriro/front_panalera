import { z } from 'zod'

export const inventorySchema = z.object({
  description: z.string().trim().min(1, 'La descripcion es obligatoria').max(255, 'La descripcion no puede superar 255 caracteres'),
  code_inventory: z
    .string()
    .trim()
    .max(100, 'El SKU no puede superar 100 caracteres')
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  barcode_inventory: z
    .string()
    .trim()
    .max(100, 'El codigo de barras no puede superar 100 caracteres')
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
