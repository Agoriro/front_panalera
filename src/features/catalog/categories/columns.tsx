import { ColumnDef } from '@tanstack/react-table'
import { Category } from '../../../types/catalog'

export const getCategoryColumns = (
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void
): ColumnDef<Category>[] => [
  {
    accessorKey: 'name',
    header: 'Categoría',
  },
]

