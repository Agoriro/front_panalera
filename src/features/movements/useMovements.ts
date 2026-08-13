import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMovementsApi, createMovementApi, MOVEMENT_KEYS } from '../../api/movements'
import { getInventoryApi, INVENTORY_KEYS } from '../../api/inventory'
import { getSuppliersApi, CATALOG_KEYS } from '../../api/catalog'

export const useMovements = () => {
  const queryClient = useQueryClient()

  // Movements Query
  const movementsQuery = useQuery({
    queryKey: MOVEMENT_KEYS.all,
    queryFn: () => getMovementsApi(),
  })

  // Inventory Query for Select Dropdown
  const inventoryQuery = useQuery({
    queryKey: INVENTORY_KEYS.all,
    queryFn: getInventoryApi,
  })

  // Suppliers Query for Buy Movement Selector
  const suppliersQuery = useQuery({
    queryKey: CATALOG_KEYS.suppliers,
    queryFn: getSuppliersApi,
    select: (data) => data.filter((s) => s.is_active),
  })

  // Create Movement Mutation
  const createMovementMutation = useMutation({
    mutationFn: createMovementApi,
    onSuccess: () => {
      // Invalidate movements and inventory (since stock and costs update)
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  return {
    movements: movementsQuery.data || [],
    isLoadingMovements: movementsQuery.isLoading,
    inventory: inventoryQuery.data || [],
    isLoadingInventory: inventoryQuery.isLoading,
    suppliers: suppliersQuery.data || [],
    isLoadingSuppliers: suppliersQuery.isLoading,
    createMovement: createMovementMutation.mutateAsync,
    isRegistering: createMovementMutation.isPending,
  }
}
export default useMovements
