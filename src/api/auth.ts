import apiClient from './client'
import { LoginResponse } from '../types/auth'

export const AUTH_KEYS = {
  session: ['auth', 'session'] as const,
}

export async function loginApi(body: Record<string, string>): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', body)
  return response.data
}

export async function refreshApi(refreshToken: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  return response.data
}
