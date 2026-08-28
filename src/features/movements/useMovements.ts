import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMovementsApi, createPurchaseApi, createSaleApi, MOVEMENT_KEYS } from '../../api/movements'
import { getInventoryApi, INVENTORY_KEYS } from '../../api/inventory'
import { getSuppliersApi, CATALOG_KEYS } from '../../api/catalog'
import type { Page } from '../../types/pagination'
import type { Movement } from '../../types/movement'

export const useMovements = (inventorySearch = '') => {
  const queryClient = useQueryClient()

  // Movements Query
  const movementsQuery = useQuery({
    queryKey: MOVEMENT_KEYS.all,
    queryFn: () => getMovementsApi({ page_size: 100 }),
  })

  // Inventory Query for Select Dropdown
  const inventoryQuery = useQuery({
    queryKey: INVENTORY_KEYS.list({ page_size: 100, search: inventorySearch || undefined }),
    queryFn: () => getInventoryApi({ page_size: 100, search: inventorySearch || undefined }),
  })

  // Suppliers Query for Buy Movement Selector
  const suppliersQuery = useQuery({
    queryKey: CATALOG_KEYS.suppliers,
    queryFn: getSuppliersApi,
    select: (data) => data.filter((s) => s.is_active),
  })

  // Create Movement Mutation
  const purchaseMutation = useMutation({
    mutationFn: createPurchaseApi,
    onSuccess: (createdMovement) => {
      queryClient.setQueryData<Page<Movement>>(MOVEMENT_KEYS.all, (current) => {
        if (!current) {
          return {
            items: [createdMovement],
            total: 1,
            page: 1,
            page_size: 100,
            pages: 1,
          }
        }

        const alreadyExists = current.items.some((item) => item.id === createdMovement.id)
        return {
          ...current,
          items: [createdMovement, ...current.items.filter((item) => item.id !== createdMovement.id)],
          total: current.total + (alreadyExists ? 0 : 1),
        }
      })

      // La respuesta del POST ya es autoritativa. Evita un GET inmediato que pueda
      // adelantarse al commit de la transacción y borrar temporalmente la nueva fila.
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all, refetchType: 'none' })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  const saleMutation = useMutation({
    mutationFn: createSaleApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all })
    },
  })

  const suppliers = suppliersQuery.data || []
  const movementItems = movementsQuery.data?.items || []
  const inventory = (inventoryQuery.data?.items || []).map((item) => {
    const itemMovements = movementItems.filter((movement) => movement.id_inventory === item.id)
    const latestPurchase = itemMovements
      .filter((movement) => movement.type_movement === 'BUY')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    return {
      ...item,
      stock_qty: itemMovements.reduce((stock, movement) => {
      if (movement.id_inventory !== item.id) return stock
      return stock + (movement.type_movement === 'BUY' ? movement.quantity : -movement.quantity)
      }, 0),
      cost_price: latestPurchase ? Number(latestPurchase.unit_cost) : 0,
      supplier: suppliers.find((supplier) => supplier.id === item.id_supplier),
    }
  })

  return {
    movements: movementItems.map((movement) => ({
      ...movement,
      inventory: inventory.find((item) => item.id === movement.id_inventory),
      supplier: suppliers.find((supplier) => supplier.id === movement.id_supplier),
    })),
    isLoadingMovements: movementsQuery.isLoading,
    inventory,
    isLoadingInventory: inventoryQuery.isLoading,
    suppliers,
    isLoadingSuppliers: suppliersQuery.isLoading,
    createPurchase: purchaseMutation.mutateAsync,
    createSale: saleMutation.mutateAsync,
    isRegistering: purchaseMutation.isPending || saleMutation.isPending,
  }
}
export default useMovements
