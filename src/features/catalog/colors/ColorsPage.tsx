import React, { useState } from 'react'
import { useColors } from './useColors'
import { Color } from '../../../types/catalog'
import { ColorForm } from './Form'
import { ColorInput } from './schema'
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

export const ColorsPage: React.FC = () => {
  const {
    colors,
    isLoading,
    createColor,
    isCreating,
    updateColor,
    isUpdating,
    deleteColor,
  } = useColors()

  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [deletingColor, setDeletingColor] = useState<Color | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredColors = colors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hex_value?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredColors.length / itemsPerPage)
  const paginatedColors = filteredColors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreateOrUpdate = async (data: ColorInput) => {
    try {
      if (editingColor) {
        await updateColor({ id: editingColor.id, body: data })
        toast.success('Color actualizado correctamente')
      } else {
        await createColor(data)
        toast.success('Color creado correctamente')
      }
      setIsFormOpen(false)
      setEditingColor(null)
    } catch (e) {
      toast.error('Ocurrió un error al guardar el color')
    }
  }

  const handleDelete = async () => {
    if (!deletingColor) return
    try {
      await deleteColor(deletingColor.id)
      toast.success('Color eliminado correctamente')
      setDeletingColor(null)
      if (paginatedColors.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (e) {
      toast.error('No se pudo eliminar el color, es posible que esté asociado a productos.')
      setDeletingColor(null)
    }
  }

  const handleOpenEdit = (color: Color) => {
    setEditingColor(color)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingColor(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
            Colores
          </h1>
          <p className="text-sm text-text-muted">
            Administra los colores disponibles para los productos del inventario.
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="font-display font-medium text-sm gap-2">
              <Plus className="h-4.5 w-4.5" />
              Nuevo Color
            </Button>
          </DialogTrigger>
          <ColorForm
            color={editingColor}
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
              placeholder="Buscar color o hex..."
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
        ) : paginatedColors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <FolderOpen className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-base dark:text-white">
              No se encontraron colores
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-xs">
              {searchTerm ? 'Prueba ajustando tu búsqueda' : 'Registra tu primer color para comenzar.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleOpenCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Registrar Color
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display font-semibold">Nombre</TableHead>
                  <TableHead className="font-display font-semibold">Código Muestra</TableHead>
                  <TableHead className="font-display font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-display font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedColors.map((color) => (
                  <TableRow key={color.id} className="hover:bg-surface/50 dark:hover:bg-muted/10">
                    <TableCell className="font-medium text-text-base dark:text-white">
                      {color.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {color.hex_value && (
                          <div
                            className="h-5 w-5 rounded-md border border-border-soft shadow-inner"
                            style={{ backgroundColor: color.hex_value }}
                          />
                        )}
                        <span className="font-mono text-xs">{color.hex_value || 'Sin código'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          color.is_active
                            ? 'bg-secondary/15 text-secondary border border-secondary/25'
                            : 'bg-danger/15 text-danger border border-danger/25'
                        }`}
                      >
                        {color.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(color)}
                          className="text-text-muted hover:text-primary dark:hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingColor(color)}
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
                  Página {currentPage} de {totalPages} ({filteredColors.length} colores)
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
        open={deletingColor !== null}
        onOpenChange={(isOpen) => !isOpen && setDeletingColor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold">
              ¿Estás seguro de eliminar este color?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el color{' '}
              <span className="font-semibold text-text-base dark:text-white">
                {deletingColor?.name}
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

export default ColorsPage
