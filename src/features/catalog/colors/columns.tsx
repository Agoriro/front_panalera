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
]


