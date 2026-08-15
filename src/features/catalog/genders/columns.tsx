import { ColumnDef } from '@tanstack/react-table'
import { Gender } from '../../../types/catalog'

export const getGenderColumns = (
  onEdit: (gender: Gender) => void,
  onDelete: (gender: Gender) => void
): ColumnDef<Gender>[] => [
  {
    accessorKey: 'name',
    header: 'Género',
  },
]

