import apiClient from './client'
import { User, UserFormInput } from '../types/user'
import { Page, PageParams } from '../types/pagination'

export const USER_KEYS = {
  all: ['users'] as const,
}

export async function getUsersApi(params?: PageParams): Promise<Page<User>> {
  const res = await apiClient.get<Page<User>>('/users', { params })
  return res.data
}

export async function createUserApi(body: UserFormInput): Promise<User> {
  const res = await apiClient.post<User>('/users', body)
  return res.data
}

export async function updateUserApi(id: string, body: Partial<UserFormInput>): Promise<User> {
  const res = await apiClient.put<User>(`/users/${id}`, body)
  return res.data
}

export async function deleteUserApi(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
