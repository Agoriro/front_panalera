import React, { useState } from 'react'
import { useInventory } from './useInventory'
import { InventoryItem } from '../../types/inventory'
import { InventoryCard } from './InventoryCard'
import { InventoryForm } from './InventoryForm'
import { InventoryInput } from './inventorySchema'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Sheet, SheetTrigger } from '../../components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Skeleton } from '../../components/ui/skeleton'
import { useDebounce } from '../../hooks/useDebounce'
import { Plus, Search, Edit2, Trash2, LayoutGrid, List, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'

export const InventoryPage: React.FC = () => {
  // Layout View Mode (grid or table)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all') // all, available, out_of_stock, low_stock

  // Debounce search term to avoid hitting backend on every keystroke
  const debouncedSearch = useDebounce(searchTerm, 350)

  const {
    inventory,
    isLoading,
    suppliers,
    categories,
    colors,
    sizes,
    genders,
    createItem,
    updateItem,
    deleteItem,
    uploadPhotos,
    deletePhoto,
  } = useInventory({ search: debouncedSearch.trim() || undefined })

  // Sheet/Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filtering Logic (client-side filters for category and stock on backend response)
  const filteredInventory = inventory.filter((item) => {
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !term ||
      item.description.toLowerCase().includes(term) ||
      (item.code_inventory && item.code_inventory.toLowerCase().includes(term)) ||
      (item.barcode_inventory && item.barcode_inventory.toLowerCase().includes(term))

    const matchesCategory = selectedCategory === 'all' || item.id_category === selectedCategory

    let matchesStock = true
    if (stockFilter === 'available') {
      matchesStock = item.stock_qty > 0
    } else if (stockFilter === 'out_of_stock') {
      matchesStock = item.stock_qty === 0
    } else if (stockFilter === 'low_stock') {
      matchesStock = item.stock_qty > 0 && item.stock_qty < 5
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage)
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleOpenCreate = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
    })
  }

  const handleCreateOrUpdate = async (
    data: InventoryInput,
    photoFiles: File[],
    deletedPhotoIds: string[]
  ) => {
    setIsSaving(true)
    try {
      let savedItem: InventoryItem

      if (editingItem) {
        savedItem = await updateItem({ id: editingItem.id, body: data })
        // Process deletions of existing photos
        if (deletedPhotoIds.length > 0) {
          for (const photoId of deletedPhotoIds) {
            await deletePhoto({ id: editingItem.id, photoId })
          }
        }
        toast.success('Artículo actualizado correctamente')
      } else {
        savedItem = await createItem(data)
        toast.success('Artículo registrado correctamente')
      }

      // Upload new photos if any
      if (photoFiles.length > 0 && savedItem?.id) {
        toast.info('Subiendo fotos del artículo...')
        const base64Urls = await Promise.all(photoFiles.map(fileToBase64))
        await uploadPhotos({ id: savedItem.id, urls: base64Urls })
        toast.success('Fotos cargadas exitosamente')
      }

      setIsFormOpen(false)
      setEditingItem(null)
    } catch (e) {
      toast.error('Ocurrió un error al guardar el artículo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      await deleteItem(deletingItem.id)
      toast.success('Artículo eliminado del inventario')
      setDeletingItem(null)
      if (paginatedInventory.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (e) {
      toast.error('No se pudo eliminar el artículo, tiene movimientos de compra o venta asociados.')
      setDeletingItem(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
            Inventario de Artículos
          </h1>
          <p className="text-sm text-text-muted">
            Consulta stock, administra precios, y edita descripciones de productos.
          </p>
        </div>

        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <Button onClick={handleOpenCreate} className="font-display font-medium text-sm gap-2">
            <Plus className="h-4.5 w-4.5" />
            Nuevo Artículo
          </Button>
          <InventoryForm
            item={editingItem}
            suppliers={suppliers}
            categories={categories}
            colors={colors}
            sizes={sizes}
            genders={genders}
            onSubmit={handleCreateOrUpdate}
            isSubmitting={isSaving}
          />
        </Sheet>
      </div>

      {/* Filters and View Toggles */}
      <div className="rounded-xl border border-border-soft bg-surface-card dark:border-border-soft dark:bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1 max-w-3xl">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <Search className="h-4.5 w-4.5" />
              </span>
              <Input
                type="text"
                placeholder="Buscar por descripción, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={(val) => { setStockFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el Inventario</SelectItem>
                <SelectItem value="available">Con Stock</SelectItem>
                <SelectItem value="out_of_stock">Agotado</SelectItem>
                <SelectItem value="low_stock">Stock Bajo (&lt; 5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggler */}
          <div className="flex items-center rounded-lg border border-border-soft p-1 dark:border-border-soft shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-base'
              }`}
              aria-label="Ver como tabla"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-base'
              }`}
              aria-label="Ver como tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Display Content */}
        {isLoading ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <PackageOpen className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-base dark:text-white">
              No se encontraron artículos
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-xs">
              {searchTerm || selectedCategory !== 'all' || stockFilter !== 'all'
                ? 'Prueba modificando tus filtros o búsqueda'
                : 'Registra tu primer artículo en inventario.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && stockFilter === 'all' && (
              <Button onClick={handleOpenCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Registra tu primer artículo
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
              {paginatedInventory.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={handleOpenEdit}
                  onDelete={setDeletingItem}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display font-semibold">Código / SKU</TableHead>
                  <TableHead className="font-display font-semibold">Cód. Barras</TableHead>
                  <TableHead className="font-display font-semibold">Descripción</TableHead>
                  <TableHead className="font-display font-semibold">Categoría</TableHead>
                  <TableHead className="font-display font-semibold">Color</TableHead>
                  <TableHead className="font-display font-semibold">Talla</TableHead>
                  <TableHead className="font-display font-semibold">Género</TableHead>
                  <TableHead className="font-display font-semibold">Stock Actual</TableHead>
                  <TableHead className="font-display font-semibold">Utilidad %</TableHead>
                  <TableHead className="font-display font-semibold">Precio Venta</TableHead>
                  <TableHead className="text-right font-display font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInventory.map((item) => {
                  const cost = item.cost_price || 0
                  const salePrice = cost * (1 + item.utility / 100)

                  let stockBadgeClass = 'bg-secondary/15 text-secondary border border-secondary/25'
                  if (item.stock_qty === 0) {
                    stockBadgeClass = 'bg-danger/15 text-danger border border-danger/25'
                  } else if (item.stock_qty < 5) {
                    stockBadgeClass = 'bg-accent/15 text-accent border border-accent/25'
                  }

                  return (
                    <TableRow key={item.id} className="hover:bg-surface/50 dark:hover:bg-muted/10">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {item.code_inventory || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {item.barcode_inventory || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-text-base dark:text-white max-w-[200px] truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.category?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {item.color?.hex_value && (
                            <div
                              className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
                              style={{ backgroundColor: item.color.hex_value }}
                            />
                          )}
                          <span>{item.color?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.size?.name || 'N/A'}</TableCell>
                      <TableCell>{item.gender?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stockBadgeClass}`}>
                          {item.stock_qty} uds
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.utility}%</TableCell>
                      <TableCell className="font-mono font-semibold text-text-base dark:text-white">
                        {formatCurrency(salePrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(item)}
                            className="text-text-muted hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeletingItem(item)}
                            className="text-text-muted hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between pt-6 border-t border-border-soft mt-4 dark:border-border-soft">
            <span className="text-xs text-text-muted">
              Página {currentPage} de {totalPages} ({filteredInventory.length} artículos)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Product Alert Dialog */}
      <AlertDialog
        open={deletingItem !== null}
        onOpenChange={(isOpen) => !isOpen && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold">
              ¿Estás seguro de eliminar este artículo del inventario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{' '}
              <span className="font-semibold text-text-base dark:text-white">
                {deletingItem?.description}
              </span>{' '}
              y toda su configuración física de color, talla y categoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-danger hover:bg-danger/80 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default InventoryPage
