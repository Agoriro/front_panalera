import apiClient from './client'
import { Movement } from '../types/movement'
import { Page } from '../types/pagination'

export interface SalesReportPage extends Page<Movement> {
  total_revenue: string
  total_profit: string
}

export interface SalesReportParams {
  date_from: string
  date_to: string
  page?: number
  page_size?: number
}

export interface InventoryReportItem {
  id_inventory: string
  total_bought: number
  total_sold: number
  current_stock: number
}

interface SaleReportWire {
  id_movement: string
  date: string
  id_inventory: string
  quantity: number
  value_sell: string
  last_purchase_price: string
  profit: string
}

export async function getSalesReportApi(params: SalesReportParams): Promise<SalesReportPage> {
  const response = await apiClient.get<Omit<SalesReportPage, 'items'> & { items: SaleReportWire[] }>('/reports/sales', { params })
  return {
    ...response.data,
    items: response.data.items.map((item) => ({
      id: item.id_movement,
      id_inventory: item.id_inventory,
      id_supplier: null,
      type_movement: 'SELL',
      quantity: item.quantity,
      value: item.value_sell,
      unit_cost: item.last_purchase_price,
      created_at: item.date,
    })),
  }
}

export async function getInventoryReportApi(): Promise<InventoryReportItem[]> {
  const response = await apiClient.get<InventoryReportItem[]>('/reports/inventory')
  return Array.isArray(response.data) ? response.data : []
}
