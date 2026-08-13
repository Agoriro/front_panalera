import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInventoryApi,
  createInventoryApi,
  updateInventoryApi,
  deleteInventoryApi,
  uploadInventoryPhotosApi,
  deleteInventoryPhotoApi,
  INVENTORY_KEYS,
} from '../../api/inventory'
import {
  getSuppliersApi,
  getCategoriesApi,
  getColorsApi,
  getSizesApi,
  getGendersApi,
  CATALOG_KEYS,
} from '../../api/catalog'
import { InventoryFormInput, InventoryQueryParams } from '../../types/inventory'

export const useInventory = (params?: InventoryQueryParams) => {
  const queryClient = useQueryClient()

  // Primary Query
  const query = useQuery({
    queryKey: params ? INVENTORY_KEYS.list(params) : INVENTORY_KEYS.all,
    queryFn: () => getInventoryApi(params),
  })

  // Catalog Queries for the Form Dropdowns
  const suppliersQuery = useQuery({
    queryKey: CATALOG_KEYS.suppliers,
    queryFn: getSuppliersApi,
    select: (data) => data.filter((s) => s.is_active),
  })

  const categoriesQuery = useQuery({
    queryKey: CATALOG_KEYS.categories,
    queryFn: getCategoriesApi,
    select: (data) => data.filter((c) => c.is_active),
  })

  const colorsQuery = useQuery({
    queryKey: CATALOG_KEYS.colors,
    queryFn: getColorsApi,
    select: (data) => data.filter((c) => c.is_active),
  })

  const sizesQuery = useQuery({
    queryKey: CATALOG_KEYS.sizes,
    queryFn: getSizesApi,
    select: (data) => data.filter((s) => s.is_active),
  })

  const gendersQuery = useQuery({
    queryKey: CATALOG_KEYS.genders,
    queryFn: getGendersApi,
    select: (data) => data.filter((g) => g.is_active),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createInventoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: InventoryFormInput }) =>
      updateInventoryApi(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  const uploadPhotosMutation = useMutation({
    mutationFn: ({ id, urls }: { id: string; urls: string[] }) =>
      uploadInventoryPhotosApi(id, urls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: ({ id, photoId }: { id: string; photoId: string }) =>
      deleteInventoryPhotoApi(id, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  return {
    inventory: query.data || [],
    isLoading: query.isLoading,
    error: query.error,

    // Catalogs data
    suppliers: suppliersQuery.data || [],
    categories: categoriesQuery.data || [],
    colors: colorsQuery.data || [],
    sizes: sizesQuery.data || [],
    genders: gendersQuery.data || [],
    isLoadingCatalogs:
      suppliersQuery.isLoading ||
      categoriesQuery.isLoading ||
      colorsQuery.isLoading ||
      sizesQuery.isLoading ||
      gendersQuery.isLoading,

    // Mutations
    createItem: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateItem: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteItem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    isUploading: uploadPhotosMutation.isPending,
    deletePhoto: deletePhotoMutation.mutateAsync,
    isDeletingPhoto: deletePhotoMutation.isPending,
  }
}
export default useInventory
