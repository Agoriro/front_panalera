import { useQuery } from '@tanstack/react-query'
import { getMovementsApi, MOVEMENT_KEYS } from '../../api/movements'
import { getInventoryApi, INVENTORY_KEYS } from '../../api/inventory'

export const useReports = (params?: { start_date?: string; end_date?: string }) => {
  // Movements query (for period reports)
  const movementsQuery = useQuery({
    queryKey: params?.start_date && params?.end_date 
      ? MOVEMENT_KEYS.byPeriod(params.start_date, params.end_date)
      : MOVEMENT_KEYS.all,
    queryFn: () => getMovementsApi(params),
  })

  // Inventory query (for stock valuation report)
  const inventoryQuery = useQuery({
    queryKey: INVENTORY_KEYS.all,
    queryFn: getInventoryApi,
  })

  return {
    movements: movementsQuery.data || [],
    isLoadingMovements: movementsQuery.isLoading,
    refetchMovements: movementsQuery.refetch,
    inventory: inventoryQuery.data || [],
    isLoadingInventory: inventoryQuery.isLoading,
    refetchInventory: inventoryQuery.refetch,
  }
}
export default useReports
