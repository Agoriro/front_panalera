import apiClient from './client'
import { InventoryItem, InventoryFormInput, InventoryQueryParams } from '../types/inventory'
import { Page } from '../types/pagination'

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  item: (id: string) => ['inventory', id] as const,
  list: (params?: InventoryQueryParams) => ['inventory', params] as const,
}

type InventoryWireItem = Omit<InventoryItem, 'id' | 'description' | 'utility'> & {
  id?: string
  id_inventory?: string
  description?: string
  description_inventory?: string
  utility: number
}

const normalizeInventoryItem = (item: InventoryWireItem): InventoryItem => ({
  ...item,
  id: item.id ?? item.id_inventory ?? '',
  description: item.description ?? item.description_inventory ?? '',
  utility: item.utility <= 1 ? item.utility * 100 : item.utility,
})

const toInventoryPayload = (body: InventoryFormInput) => ({
  description_inventory: body.description.trim(),
  code_inventory: body.code_inventory?.trim() || null,
  barcode_inventory: body.barcode_inventory?.trim() || null,
  utility: body.utility / 100,
  id_supplier: body.id_supplier,
  id_category: body.id_category,
  id_color: body.id_color,
  id_size: body.id_size,
  id_gender: body.id_gender,
})

export async function getInventoryApi(params?: InventoryQueryParams): Promise<Page<InventoryItem>> {
  const res = await apiClient.get<Page<InventoryWireItem>>('/inventory', { params })
  return { ...res.data, items: res.data.items.map(normalizeInventoryItem) }
}

export async function createInventoryApi(body: InventoryFormInput): Promise<InventoryItem> {
  const res = await apiClient.post<InventoryWireItem>('/inventory', toInventoryPayload(body))
  return normalizeInventoryItem(res.data)
}

export async function updateInventoryApi(id: string, body: InventoryFormInput): Promise<InventoryItem> {
  const res = await apiClient.put<InventoryWireItem>(`/inventory/${id}`, toInventoryPayload(body))
  return normalizeInventoryItem(res.data)
}

export async function deleteInventoryApi(id: string): Promise<void> {
  await apiClient.delete(`/inventory/${id}`)
}

export async function uploadInventoryPhotosApi(id: string, urls: string[]): Promise<any> {
  const res = await apiClient.post(`/inventory/${id}/photos`, {
    url_photos: urls,
  })
  return res.data
}

export async function deleteInventoryPhotoApi(id: string, photoId: string): Promise<void> {
  await apiClient.delete(`/inventory/${id}/photos/${photoId}`)
}
