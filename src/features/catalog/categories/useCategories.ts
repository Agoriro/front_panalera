import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  CATALOG_KEYS,
} from '../../../api/catalog'
import { Category } from '../../../types/catalog'

export const useCategories = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CATALOG_KEYS.categories,
    queryFn: getCategoriesApi,
  })

  const createMutation = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.categories })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<Category, 'id'> }) =>
      updateCategoryApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.categories })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.categories })
    },
  })

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
