import apiClient from './client'
import { Role } from '../types/user'

export const ROLE_KEYS = {
  all: ['roles'] as const,
}

export async function getRolesApi(): Promise<Role[]> {
  const res = await apiClient.get<any[]>('/roles')
  return (Array.isArray(res.data) ? res.data : []).map((role) => ({
    ...role,
    id_role: role.id_role ?? role.id ?? '',
    name: role.name ?? role.name_role ?? role.role_name ?? '',
  }))
}
