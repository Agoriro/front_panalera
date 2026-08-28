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
    select: (data) => data.filter((item) => item.is_active !== false),
  })

  const categoriesQuery = useQuery({
    queryKey: CATALOG_KEYS.categories,
    queryFn: getCategoriesApi,
    select: (data) => data.filter((item) => item.is_active !== false),
  })

  const colorsQuery = useQuery({
    queryKey: CATALOG_KEYS.colors,
    queryFn: getColorsApi,
    select: (data) => data.filter((item) => item.is_active !== false),
  })

  const sizesQuery = useQuery({
    queryKey: CATALOG_KEYS.sizes,
    queryFn: getSizesApi,
    select: (data) => data.filter((item) => item.is_active !== false),
  })

  const gendersQuery = useQuery({
    queryKey: CATALOG_KEYS.genders,
    queryFn: getGendersApi,
    select: (data) => data.filter((item) => item.is_active !== false),
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

  const suppliers = suppliersQuery.data || []
  const categories = categoriesQuery.data || []
  const colors = colorsQuery.data || []
  const sizes = sizesQuery.data || []
  const genders = gendersQuery.data || []

  const inventory = (query.data?.items || []).map((item) => ({
    ...item,
    supplier: suppliers.find((catalog) => catalog.id === item.id_supplier),
    category: categories.find((catalog) => catalog.id === item.id_category),
    color: colors.find((catalog) => catalog.id === item.id_color),
    size: sizes.find((catalog) => catalog.id === item.id_size),
    gender: genders.find((catalog) => catalog.id === item.id_gender),
  }))

  return {
    inventory,
    pagination: query.data ? {
      total: query.data.total,
      page: query.data.page,
      pageSize: query.data.page_size,
      pages: query.data.pages,
    } : { total: 0, page: 1, pageSize: params?.page_size || 50, pages: 0 },
    isLoading: query.isLoading,
    error: query.error,

    // Catalogs data
    suppliers,
    categories,
    colors,
    sizes,
    genders,
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
