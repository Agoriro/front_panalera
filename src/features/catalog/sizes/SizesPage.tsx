import React, { useState } from 'react'
import { useSizes } from './useSizes'
import { Size } from '../../../types/catalog'
import { SizeForm } from './Form'
import { SizeInput } from './schema'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Dialog, DialogTrigger } from '../../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Skeleton } from '../../../components/ui/skeleton'
import { Plus, Search, Edit2, Trash2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

export const SizesPage: React.FC = () => {
  const {
    sizes,
    isLoading,
    createSize,
    isCreating,
    updateSize,
    isUpdating,
    deleteSize,
  } = useSizes()

  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [deletingSize, setDeletingSize] = useState<Size | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredSizes = (sizes || []).filter((s) => {
    const name = s?.name || (s as any)?.name_size || (s as any)?.size_name || ''
    return name.toLowerCase().includes((searchTerm || '').toLowerCase())
  })

  const totalPages = Math.ceil(filteredSizes.length / itemsPerPage)
  const paginatedSizes = filteredSizes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreateOrUpdate = async (data: SizeInput) => {
    try {
      if (editingSize) {
        await updateSize({ id: editingSize.id, body: data })
        toast.success('Talla actualizada correctamente')
      } else {
        await createSize(data)
        toast.success('Talla creada correctamente')
      }
      setIsFormOpen(false)
      setEditingSize(null)
    } catch (e) {
      toast.error('Ocurrió un error al guardar la talla')
    }
  }

  const handleDelete = async () => {
    if (!deletingSize) return
    try {
      await deleteSize(deletingSize.id)
      toast.success('Talla eliminada correctamente')
      setDeletingSize(null)
      if (paginatedSizes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (e) {
      toast.error('No se pudo eliminar la talla, es posible que esté asociada a productos.')
      setDeletingSize(null)
    }
  }

  const handleOpenEdit = (size: Size) => {
    setEditingSize(size)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingSize(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
            Tallas y Etapas
          </h1>
          <p className="text-sm text-text-muted">
            Administra las tallas, etapas o tamaños de los productos.
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="font-display font-medium text-sm gap-2">
              <Plus className="h-4.5 w-4.5" />
              Nueva Talla
            </Button>
          </DialogTrigger>
          <SizeForm
            size={editingSize}
            onSubmit={handleCreateOrUpdate}
            isSubmitting={isCreating || isUpdating}
          />
        </Dialog>
      </div>

      <div className="rounded-xl border border-border-soft bg-surface-card dark:border-border-soft dark:bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 max-w-sm mb-6">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Search className="h-4.5 w-4.5" />
            </span>
            <Input
              type="text"
              placeholder="Buscar talla..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : paginatedSizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <FolderOpen className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-base dark:text-white">
              No se encontraron tallas
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-xs">
              {searchTerm ? 'Prueba ajustando tu búsqueda' : 'Registra tu primera talla para comenzar.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleOpenCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Registrar Talla
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display font-semibold">Nombre</TableHead>
                  <TableHead className="text-right font-display font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSizes.map((size) => (
                  <TableRow key={size.id} className="hover:bg-surface/50 dark:hover:bg-muted/10">
                    <TableCell className="font-medium text-text-base dark:text-white">
                      {size?.name || (size as any)?.name_size || (size as any)?.size_name || 'Sin nombre'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(size)}
                          className="text-text-muted hover:text-primary dark:hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingSize(size)}
                          className="text-text-muted hover:text-danger dark:hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border-soft mt-4 dark:border-border-soft">
                <span className="text-xs text-text-muted">
                  Página {currentPage} de {totalPages} ({filteredSizes.length} tallas)
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
        )}
      </div>

      <AlertDialog
        open={deletingSize !== null}
        onOpenChange={(isOpen) => !isOpen && setDeletingSize(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold">
              ¿Estás seguro de eliminar esta talla?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la talla{' '}
              <span className="font-semibold text-text-base dark:text-white">
                {deletingSize?.name || (deletingSize as any)?.name_size || ''}
              </span>{' '}
              de la base de datos.
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

export default SizesPage
