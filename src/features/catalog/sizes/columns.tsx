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
]

