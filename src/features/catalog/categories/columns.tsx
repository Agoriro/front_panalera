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
  {
    accessorKey: 'is_active',
    header: 'Estado',
    cell: ({ row }) => {
      const active = row.getValue('is_active') as boolean
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            active
              ? 'bg-secondary/15 text-secondary border border-secondary/25'
              : 'bg-danger/15 text-danger border border-danger/25'
          }`}
        >
          {active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  },
]
