import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSuppliersApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
  CATALOG_KEYS,
} from '../../../api/catalog'
import { Supplier } from '../../../types/catalog'

export const useSuppliers = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CATALOG_KEYS.suppliers,
    queryFn: getSuppliersApi,
  })

  const createMutation = useMutation({
    mutationFn: createSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.suppliers })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<Supplier, 'id'> }) =>
      updateSupplierApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.suppliers })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.suppliers })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleSupplierApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.suppliers })
    },
  })

  return {
    suppliers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createSupplier: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSupplier: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleSupplier: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    deleteSupplier: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
