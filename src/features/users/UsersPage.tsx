import React, { useState } from 'react'
import { useUsers } from './useUsers'
import { User } from '../../types/user'
import { UserForm } from './UserForm'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Dialog, DialogTrigger } from '../../components/ui/dialog'
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
import { Plus, Search, Edit2, Trash2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { handleApiError } from '../../lib/utils'

export const UsersPage: React.FC = () => {
  const {
    users,
    isLoading,
    roles,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
  } = useUsers()

  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredUsers = users.filter(
    (u) =>
      (u.user || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreateOrUpdate = async (formData: any) => {
    setIsSaving(true)
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id_user, body: formData })
        toast.success('Usuario actualizado correctamente')
      } else {
        await createUser(formData)
        toast.success('Usuario creado correctamente')
      }
      setIsFormOpen(false)
      setEditingUser(null)
    } catch (e) {
      handleApiError(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      await deleteUser(deletingUser.id_user)
      toast.success('Usuario eliminado correctamente')
      setDeletingUser(null)
      if (paginatedUsers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (e) {
      handleApiError(e)
      setDeletingUser(null)
    }
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-base dark:text-white">
            Usuarios y Roles
          </h1>
          <p className="text-sm text-text-muted">
            Administra los usuarios del sistema, asignación de roles y accesos permitidos.
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="font-display font-medium text-sm gap-2">
              <Plus className="h-4.5 w-4.5" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <UserForm
            user={editingUser}
            roles={roles}
            onSubmit={handleCreateOrUpdate}
            isSubmitting={isSaving}
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
              placeholder="Buscar por usuario o email..."
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
        ) : paginatedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <ShieldAlert className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-base dark:text-white">
              No se encontraron usuarios
            </h3>
            <p className="text-sm text-text-muted mt-1 max-w-xs">
              {searchTerm ? 'Prueba ajustando tu búsqueda' : 'Registra tu primer usuario para comenzar.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleOpenCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Registrar Usuario
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display font-semibold">Usuario</TableHead>
                  <TableHead className="font-display font-semibold">Rol Asignado</TableHead>
                  <TableHead className="font-display font-semibold">Estado</TableHead>
                  <TableHead className="text-right font-display font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id_user} className="hover:bg-surface/50 dark:hover:bg-muted/10">
                    <TableCell className="font-medium text-text-base dark:text-white">
                      {user.user}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary uppercase font-mono tracking-wider">
                        {user.role?.name || roles.find(r => r.id_role === user.id_role)?.name || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.is_active
                            ? 'bg-secondary/15 text-secondary border border-secondary/25'
                            : 'bg-danger/15 text-danger border border-danger/25'
                        }`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(user)}
                          className="text-text-muted hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingUser(user)}
                          className="text-text-muted hover:text-danger"
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
                  Página {currentPage} de {totalPages} ({filteredUsers.length} usuarios)
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
        open={deletingUser !== null}
        onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold">
              ¿Estás seguro de eliminar este usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al usuario{' '}
              <span className="font-semibold text-text-base dark:text-white">
                {deletingUser?.user}
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

export default UsersPage
