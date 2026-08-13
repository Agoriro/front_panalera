import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSizesApi,
  createSizeApi,
  updateSizeApi,
  deleteSizeApi,
  CATALOG_KEYS,
} from '../../../api/catalog'
import { Size } from '../../../types/catalog'

export const useSizes = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CATALOG_KEYS.sizes,
    queryFn: getSizesApi,
  })

  const createMutation = useMutation({
    mutationFn: createSizeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.sizes })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<Size, 'id'> }) =>
      updateSizeApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.sizes })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSizeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.sizes })
    },
  })

  return {
    sizes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createSize: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSize: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSize: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
