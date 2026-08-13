import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getColorsApi,
  createColorApi,
  updateColorApi,
  deleteColorApi,
  CATALOG_KEYS,
} from '../../../api/catalog'
import { Color } from '../../../types/catalog'

export const useColors = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CATALOG_KEYS.colors,
    queryFn: getColorsApi,
  })

  const createMutation = useMutation({
    mutationFn: createColorApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.colors })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<Color, 'id'> }) =>
      updateColorApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.colors })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteColorApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.colors })
    },
  })

  return {
    colors: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createColor: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateColor: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteColor: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
