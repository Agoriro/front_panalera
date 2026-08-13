import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatDate(date: string | Date | number): string {
  if (!date) return ''
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

export function handleApiError(error: unknown) {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') {
      toast.error(detail)
      return
    }
    if (Array.isArray(detail)) {
      // Pydantic validation errors
      detail.forEach((err: { msg: string; loc: (string | number)[] }) => {
        toast.error(`${err.loc.join('.')}: ${err.msg}`)
      })
      return
    }
    const message = error.response?.data?.message || error.message
    toast.error(message || 'Ha ocurrido un error en el servidor')
  } else if (error instanceof Error) {
    toast.error(error.message)
  } else {
    toast.error('Ha ocurrido un error inesperado')
  }
}

export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}
