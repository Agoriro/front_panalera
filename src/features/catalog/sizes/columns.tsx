import { ColumnDef } from '@tanstack/react-table'
import { Size } from '../../../types/catalog'

export const getSizeColumns = (
  onEdit: (size: Size) => void,
  onDelete: (size: Size) => void
): ColumnDef<Size>[] => [
  {
    accessorKey: 'name',
    header: 'Talla / Etapa',
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
