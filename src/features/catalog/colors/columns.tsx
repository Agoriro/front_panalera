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
]

