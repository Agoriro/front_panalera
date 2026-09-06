import apiClient from './client'
import { Movement, MovementUpdateInput, PurchaseFormInput, SaleFormInput } from '../types/movement'
import { Page, PageParams } from '../types/pagination'

export const MOVEMENT_KEYS = {
  all: ['movements'] as const,
  byPeriod: (startDate: string, endDate: string) => ['movements', 'period', startDate, endDate] as const,
}

export interface MovementQueryParams extends PageParams {
  date_from?: string
  date_to?: string
}

type MovementWire = Omit<Movement, 'id' | 'created_at'> & {
  id_movement: string
  date: string
  created_at?: string | null
}

export const normalizeMovement = (movement: MovementWire): Movement => ({
  ...movement,
  id: movement.id_movement,
  type_movement: String(movement.type_movement).toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
  created_at: movement.date || movement.created_at || '',
})

export async function getMovementsApi(params?: MovementQueryParams): Promise<Page<Movement>> {
  const res = await apiClient.get<Page<MovementWire>>('/movements', { params })
  return { ...res.data, items: res.data.items.map(normalizeMovement) }
}

export async function createPurchaseApi(body: PurchaseFormInput): Promise<Movement> {
  const res = await apiClient.post<MovementWire>('/movements/purchase', body)
  return { ...normalizeMovement(res.data), type_movement: 'BUY' }
}

export async function createSaleApi(body: SaleFormInput): Promise<Movement> {
  const res = await apiClient.post<MovementWire>('/movements/sale', body)
  return { ...normalizeMovement(res.data), type_movement: 'SELL' }
}

export async function updateMovementApi(id: string, body: MovementUpdateInput): Promise<Movement> {
  const res = await apiClient.put<MovementWire>(`/movements/${id}`, body)
  return normalizeMovement(res.data)
}
