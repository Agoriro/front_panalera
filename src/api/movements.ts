import apiClient from './client'
import { Movement, MovementFormInput } from '../types/movement'

export const MOVEMENT_KEYS = {
  all: ['movements'] as const,
  byPeriod: (startDate: string, endDate: string) => ['movements', 'period', startDate, endDate] as const,
}

export async function getMovementsApi(params?: { start_date?: string; end_date?: string }): Promise<Movement[]> {
  const res = await apiClient.get<Movement[]>('/movements', { params })
  return res.data
}

export async function createMovementApi(body: MovementFormInput): Promise<Movement> {
  const res = await apiClient.post<Movement>('/movements', body)
  return res.data
}
