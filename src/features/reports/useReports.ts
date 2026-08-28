import { useQuery } from '@tanstack/react-query'
import { getInventoryReportApi, getSalesReportApi } from '../../api/reports'
import { getInventoryApi, INVENTORY_KEYS } from '../../api/inventory'
import { getMovementsApi } from '../../api/movements'
import { getCategoriesApi } from '../../api/catalog'

export const useReports = (params: { date_from: string; date_to: string; page?: number; page_size?: number }) => {
  // Movements query (for period reports)
  const movementsQuery = useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => getSalesReportApi(params),
  })

  // Inventory query (for stock valuation report)
  const inventoryQuery = useQuery({
    queryKey: INVENTORY_KEYS.all,
    queryFn: () => getInventoryApi({ page_size: 100 }),
  })

  const inventoryReportQuery = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: getInventoryReportApi,
  })

  const purchasesQuery = useQuery({
    queryKey: ['reports', 'inventory', 'purchases'],
    queryFn: () => getMovementsApi({ page: 1, page_size: 100 }),
  })

  const categoriesQuery = useQuery({
    queryKey: ['reports', 'inventory', 'categories'],
    queryFn: getCategoriesApi,
  })

  const inventory = (inventoryQuery.data?.items || []).map((item) => {
    const reportItem = inventoryReportQuery.data?.find((row) => row.id_inventory === item.id)
    const latestPurchase = (purchasesQuery.data?.items || [])
      .filter((movement) => movement.id_inventory === item.id && movement.type_movement === 'BUY')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    const category = categoriesQuery.data?.find((entry) => entry.id === item.id_category)

    return {
      ...item,
      stock_qty: Number(reportItem?.current_stock ?? 0),
      cost_price: Number(latestPurchase?.unit_cost ?? latestPurchase?.value ?? 0),
      category,
    }
  })

  return {
    movements: (movementsQuery.data?.items || []).map((movement) => ({
      ...movement,
      inventory: inventoryQuery.data?.items.find((item) => item.id === movement.id_inventory),
    })),
    totals: {
      revenue: movementsQuery.data?.total_revenue || '0',
      profit: movementsQuery.data?.total_profit || '0',
    },
    pagination: movementsQuery.data,
    isLoadingMovements: movementsQuery.isLoading,
    refetchMovements: movementsQuery.refetch,
    inventory,
    isLoadingInventory: inventoryQuery.isLoading || inventoryReportQuery.isLoading || purchasesQuery.isLoading || categoriesQuery.isLoading,
    refetchInventory: inventoryQuery.refetch,
  }
}
export default useReports
