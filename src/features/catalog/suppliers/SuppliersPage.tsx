import React, { useState } from 'react'
import { useSuppliers } from './useSuppliers'
import { Supplier } from '../../../types/catalog'
import { SupplierForm } from './Form'
import { SupplierInput } from './schema'
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

export const SuppliersPage: React.FC = () => {
  const {
    suppliers,
    isLoading,
    createSupplier,
    isCreating,
    updateSupplier,
    isUpdating,
    deleteSupplier,
  } = useSuppliers()

  // State controls
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name_supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreateOrUpdate = async (data: SupplierInput) => {
    try {
      if (editingSupplier) {
        await updateSupplier({ id: editingSupplier.id, body: data })
        toast.success('Proveedor actualizado correctamente')
      } else {
        await createSupplier(data)
        toast.success('Proveedor creado correctamente')
      }
      setIsFormOpen(false)
      setEditingSupplier(null)
    } catch (e) {
      toast.error('Ocurrió un error al guardar el proveedor')
    }
  }

  const handleDelete = async () => {
    if (!deletingSupplier) return
    try {
      await deleteSupplier(deletingSupplier.id)
      toast.success('Proveedor eliminado correctamente')
      setDeletingSupplier(null)
      // Adjust page if empty
      if (paginatedSuppliers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (e) {
      toast.error('No se pudo eliminar el proveedor, es posible que esté asociado a productos.')
      setDeletingSupplier(null)
    }
  }

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingSupplier(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
            Proveedores
          </h1>
          <p className="text-sm text-text-muted">
            Administra los proveedores de pañales y artículos de bebé.
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="font-display font-medium text-sm gap-2">
              <Plus className="h-4.5 w-4.5" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleCreateOrUpdate}
            isSubmitting={isCreating || isUpdating}
          />
        </Dialog>
      </div>

      {/* Main Card with filters & table */}
      <div className="rounded-xl border border-border-soft bg-surface-card dark:border-border-soft dark:bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 max-w-sm mb-6">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Search className="h-4.5 w-4.5" />
            </span>
            <Input
              type="text"
              placeholder="Buscar por nombre o dirección..."
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : paginatedSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <FolderOpen className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-base dark:text-white">
              No se encontraron proveedores
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-xs">
              {searchTerm ? 'Prueba ajustando tu búsqueda' : 'Registra tu primer proveedor para comenzar.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleOpenCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Registrar Proveedor
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display font-semibold">Nombre</TableHead>
                  <TableHead className="font-display font-semibold">Dirección</TableHead>
                  <TableHead className="font-display font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-display font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-surface/50 dark:hover:bg-muted/10">
                    <TableCell className="font-medium text-text-base dark:text-white">
                      {supplier.name_supplier}
                    </TableCell>
                    <TableCell className="text-text-muted">{supplier.address}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          supplier.is_active
                            ? 'bg-secondary/15 text-secondary border border-secondary/25'
                            : 'bg-danger/15 text-danger border border-danger/25'
                        }`}
                      >
                        {supplier.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(supplier)}
                          className="text-text-muted hover:text-primary dark:hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingSupplier(supplier)}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border-soft mt-4 dark:border-border-soft">
                <span className="text-xs text-text-muted">
                  Página {currentPage} de {totalPages} ({filteredSuppliers.length} proveedores)
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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={deletingSupplier !== null}
        onOpenChange={(isOpen) => !isOpen && setDeletingSupplier(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold">
              ¿Estás seguro de eliminar este proveedor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al proveedor{' '}
              <span className="font-semibold text-text-base dark:text-white">
                {deletingSupplier?.name_supplier}
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

export default SuppliersPage
