import apiClient from './client'
import { Role } from '../types/user'

export const ROLE_KEYS = {
  all: ['roles'] as const,
}

export async function getRolesApi(): Promise<Role[]> {
  const res = await apiClient.get<Role[]>('/roles')
  return res.data
}
