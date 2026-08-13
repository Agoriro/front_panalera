import { ColumnDef } from '@tanstack/react-table'
import { Color } from '../../../types/catalog'

export const getColorColumns = (
  onEdit: (color: Color) => void,
  onDelete: (color: Color) => void
): ColumnDef<Color>[] => [
  {
    accessorKey: 'name',
    header: 'Color',
  },
  {
    accessorKey: 'hex_value',
    header: 'Muestra',
    cell: ({ row }) => {
      const hex = row.getValue('hex_value') as string
      return (
        <div className="flex items-center gap-2">
          {hex && (
            <div
              className="h-5 w-5 rounded-md border border-border-soft shadow-inner"
              style={{ backgroundColor: hex }}
            />
          )}
          <span className="font-mono text-xs">{hex || 'Sin código'}</span>
        </div>
      )
    },
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
