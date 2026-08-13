import React from 'react'
import { InventoryItem } from '../../types/inventory'
import { formatCurrency } from '../../lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Edit2, Trash2, Tag, Layers, Settings, Barcode, Hash } from 'lucide-react'

interface InventoryCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const cost = item.cost_price || 0
  const salePrice = cost * (1 + item.utility / 100)

  // Stock badge colors
  let stockBadgeClass = 'bg-secondary/15 text-secondary border border-secondary/25'
  let stockText = 'Stock disponible'
  if (item.stock_qty === 0) {
    stockBadgeClass = 'bg-danger/15 text-danger border border-danger/25'
    stockText = 'Agotado'
  } else if (item.stock_qty < 5) {
    stockBadgeClass = 'bg-accent/15 text-accent border border-accent/25'
    stockText = 'Bajo stock'
  }

  const mainPhotoUrl = item.photo_url || (item.photos && item.photos.length > 0 ? item.photos[0].url_photo : null)

  return (
    <Card className="overflow-hidden border border-border-soft bg-surface-card dark:border-border-soft dark:bg-card hover:shadow-md transition-all flex flex-col h-full group">
      {/* Product Image Container */}
      <div className="relative aspect-video w-full bg-surface dark:bg-muted/10 flex items-center justify-center overflow-hidden border-b border-border-soft dark:border-border-soft">
        {mainPhotoUrl ? (
          <img
            src={mainPhotoUrl}
            alt={item.description}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary/30 dark:text-white/20">
            {/* Cute vector diaper baby stroller icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-16 w-16 mb-2">
              <path d="M9 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM19 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
              <path d="M12 14V3H3" />
              <path d="M19 14H8a2 2 0 0 1-2-2V7h15a1 1 0 0 1 1 1.24l-2 5a2 2 0 0 1-2 1.76z" />
            </svg>
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted">Sin Foto</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${stockBadgeClass}`}>
            {item.stock_qty} uds
          </span>
        </div>
      </div>

      <CardHeader className="p-4 pb-2 space-y-1">
        <h3 className="font-display font-semibold text-base text-text-base dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
          {item.description}
        </h3>
        <p className="text-xs text-text-muted dark:text-text-muted flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {item.category?.name || 'Categoría N/A'}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0 pb-3 flex-1 space-y-3">
        {/* Specs & Codes chips */}
        <div className="flex flex-wrap gap-1.5">
          {item.code_inventory && (
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary border border-primary/20">
              <Hash className="h-2.5 w-2.5" />
              {item.code_inventory}
            </span>
          )}
          {item.barcode_inventory && (
            <span className="inline-flex items-center gap-1 rounded bg-surface dark:bg-muted/10 px-2 py-0.5 text-[10px] font-mono font-medium text-text-base dark:text-white border border-border-soft dark:border-border-soft">
              <Barcode className="h-2.5 w-2.5 text-text-muted" />
              {item.barcode_inventory}
            </span>
          )}
          <span className="inline-flex items-center rounded bg-surface dark:bg-muted/10 px-2 py-0.5 text-[10px] font-medium text-text-base dark:text-white border border-border-soft dark:border-border-soft">
            Talla: {item.size?.name || 'N/A'}
          </span>
          <span className="inline-flex items-center rounded bg-surface dark:bg-muted/10 px-2 py-0.5 text-[10px] font-medium text-text-base dark:text-white border border-border-soft dark:border-border-soft">
            {item.gender?.name || 'N/A'}
          </span>
          {item.color && (
            <span className="inline-flex items-center gap-1 rounded bg-surface dark:bg-muted/10 px-2 py-0.5 text-[10px] font-medium text-text-base dark:text-white border border-border-soft dark:border-border-soft">
              {item.color.hex_value && (
                <span
                  className="h-2 w-2 rounded-full border border-black/10"
                  style={{ backgroundColor: item.color.hex_value }}
                />
              )}
              {item.color.name}
            </span>
          )}
        </div>

        {/* Price Calculations */}
        <div className="pt-2 border-t border-border-soft dark:border-border-soft flex justify-between items-end">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Precio Venta</p>
            <p className="font-mono font-bold text-lg text-text-base dark:text-white leading-none">
              {formatCurrency(salePrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-text-muted uppercase tracking-wider">Costo / Utilidad</p>
            <p className="text-xs font-medium font-mono text-text-base dark:text-white/80">
              {formatCurrency(cost)} <span className="text-primary text-[10px] font-sans">({item.utility}%)</span>
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-border-soft dark:border-border-soft flex justify-end gap-2 bg-surface/30 dark:bg-muted/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          className="text-text-muted hover:text-primary dark:hover:text-primary gap-1.5 h-8 text-xs"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          className="text-text-muted hover:text-danger dark:hover:text-danger gap-1.5 h-8 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  )
}

export default InventoryCard
