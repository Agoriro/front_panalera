import { ColumnDef } from '@tanstack/react-table'
import { InventoryItem } from '../../types/inventory'
import { formatCurrency } from '../../lib/utils'

export const getInventoryColumns = (
  onEdit: (item: InventoryItem) => void,
  onDelete: (item: InventoryItem) => void
): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: 'code_inventory',
    header: 'Código / SKU',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {row.original.code_inventory || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'barcode_inventory',
    header: 'Cód. Barras',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-text-muted">
        {row.original.barcode_inventory || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
  },
  {
    accessorKey: 'category.name',
    header: 'Categoría',
    cell: ({ row }) => row.original.category?.name || 'N/A',
  },
  {
    accessorKey: 'color.name',
    header: 'Color',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.color?.hex_value && (
          <div
            className="h-3.5 w-3.5 rounded-full border border-border-soft"
            style={{ backgroundColor: row.original.color.hex_value }}
          />
        )}
        <span>{row.original.color?.name || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'size.name',
    header: 'Talla',
    cell: ({ row }) => row.original.size?.name || 'N/A',
  },
  {
    accessorKey: 'gender.name',
    header: 'Género',
    cell: ({ row }) => row.original.gender?.name || 'N/A',
  },
  {
    accessorKey: 'stock_qty',
    header: 'Stock',
    cell: ({ row }) => {
      const qty = row.original.stock_qty
      let colorClass = 'bg-secondary/15 text-secondary border border-secondary/25' // normal
      if (qty === 0) {
        colorClass = 'bg-danger/15 text-danger border border-danger/25' // critical
      } else if (qty < 5) {
        colorClass = 'bg-accent/15 text-accent border border-accent/25' // low stock
      }
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
          {qty} uds
        </span>
      )
    },
  },
  {
    accessorKey: 'utility',
    header: 'Utilidad',
    cell: ({ row }) => `${row.original.utility}%`,
  },
  {
    header: 'Precio Venta',
    cell: ({ row }) => {
      const cost = row.original.cost_price || 0
      const utility = row.original.utility
      const salePrice = cost * (1 + utility / 100)
      return <span className="font-mono font-semibold">{formatCurrency(salePrice)}</span>
    },
  },
]
export default getInventoryColumns
