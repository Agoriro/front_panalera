import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGendersApi,
  createGenderApi,
  updateGenderApi,
  deleteGenderApi,
  CATALOG_KEYS,
} from '../../../api/catalog'
import { Gender } from '../../../types/catalog'

export const useGenders = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: CATALOG_KEYS.genders,
    queryFn: getGendersApi,
  })

  const createMutation = useMutation({
    mutationFn: createGenderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.genders })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Omit<Gender, 'id'> }) =>
      updateGenderApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.genders })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGenderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.genders })
    },
  })

  return {
    genders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createGender: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateGender: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteGender: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
