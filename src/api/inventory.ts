import apiClient from './client'
import { InventoryItem, InventoryFormInput, InventoryQueryParams } from '../types/inventory'

export const INVENTORY_KEYS = {
  all: ['inventory'] as const,
  item: (id: string) => ['inventory', id] as const,
  list: (params?: InventoryQueryParams) => ['inventory', params] as const,
}

export async function getInventoryApi(params?: InventoryQueryParams): Promise<InventoryItem[]> {
  const res = await apiClient.get<InventoryItem[]>('/inventory', { params })
  return res.data
}

export async function createInventoryApi(body: InventoryFormInput): Promise<InventoryItem> {
  const res = await apiClient.post<InventoryItem>('/inventory', body)
  return res.data
}

export async function updateInventoryApi(id: string, body: InventoryFormInput): Promise<InventoryItem> {
  const res = await apiClient.put<InventoryItem>(`/inventory/${id}`, body)
  return res.data
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
