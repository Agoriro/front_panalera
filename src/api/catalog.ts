import apiClient from './client'
import { Supplier, Category, Color, Size, Gender } from '../types/catalog'

export const CATALOG_KEYS = {
  suppliers: ['catalog', 'suppliers'] as const,
  categories: ['catalog', 'categories'] as const,
  colors: ['catalog', 'colors'] as const,
  sizes: ['catalog', 'sizes'] as const,
  genders: ['catalog', 'genders'] as const,
}

// === SUPPLIERS ===
export async function getSuppliersApi(): Promise<Supplier[]> {
  const res = await apiClient.get<Supplier[]>('/catalog/suppliers')
  return res.data
}

export async function createSupplierApi(body: Omit<Supplier, 'id'>): Promise<Supplier> {
  const res = await apiClient.post<Supplier>('/catalog/suppliers', body)
  return res.data
}

export async function updateSupplierApi(id: string, body: Omit<Supplier, 'id'>): Promise<Supplier> {
  const res = await apiClient.put<Supplier>(`/catalog/suppliers/${id}`, body)
  return res.data
}

export async function deleteSupplierApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/suppliers/${id}`)
}

// === CATEGORIES ===
export async function getCategoriesApi(): Promise<Category[]> {
  const res = await apiClient.get<any[]>('/catalog/categories')
  const data = Array.isArray(res.data) ? res.data : []
  return data.map((item) => ({
    ...item,
    name: item.name ?? item.name_category ?? item.category_name ?? '',
  }))
}

export async function createCategoryApi(body: Omit<Category, 'id'>): Promise<Category> {
  const payload = {
    ...body,
    name_category: body.name || (body as any).name_category,
  }
  const res = await apiClient.post<any>('/catalog/categories', payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_category ?? body.name ?? '',
  }
}

export async function updateCategoryApi(id: string, body: Omit<Category, 'id'>): Promise<Category> {
  const payload = {
    ...body,
    name_category: body.name || (body as any).name_category,
  }
  const res = await apiClient.put<any>(`/catalog/categories/${id}`, payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_category ?? body.name ?? '',
  }
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/categories/${id}`)
}

// === COLORS ===
export async function getColorsApi(): Promise<Color[]> {
  const res = await apiClient.get<any[]>('/catalog/colors')
  const data = Array.isArray(res.data) ? res.data : []
  return data.map((item) => ({
    ...item,
    name: item.name ?? item.name_color ?? item.color_name ?? '',
    hex_value: item.hex_value ?? item.hex_color ?? '',
  }))
}

export async function createColorApi(body: Omit<Color, 'id'>): Promise<Color> {
  const payload = {
    ...body,
    name_color: body.name || (body as any).name_color,
  }
  const res = await apiClient.post<any>('/catalog/colors', payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_color ?? body.name ?? '',
  }
}

export async function updateColorApi(id: string, body: Omit<Color, 'id'>): Promise<Color> {
  const payload = {
    ...body,
    name_color: body.name || (body as any).name_color,
  }
  const res = await apiClient.put<any>(`/catalog/colors/${id}`, payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_color ?? body.name ?? '',
  }
}

export async function deleteColorApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/colors/${id}`)
}

// === SIZES ===
export async function getSizesApi(): Promise<Size[]> {
  const res = await apiClient.get<any[]>('/catalog/sizes')
  const data = Array.isArray(res.data) ? res.data : []
  return data.map((item) => ({
    ...item,
    name: item.name ?? item.name_size ?? item.size_name ?? '',
  }))
}

export async function createSizeApi(body: Omit<Size, 'id'>): Promise<Size> {
  const payload = {
    ...body,
    name_size: body.name || (body as any).name_size,
  }
  const res = await apiClient.post<any>('/catalog/sizes', payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_size ?? body.name ?? '',
  }
}

export async function updateSizeApi(id: string, body: Omit<Size, 'id'>): Promise<Size> {
  const payload = {
    ...body,
    name_size: body.name || (body as any).name_size,
  }
  const res = await apiClient.put<any>(`/catalog/sizes/${id}`, payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_size ?? body.name ?? '',
  }
}

export async function deleteSizeApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/sizes/${id}`)
}

// === GENDERS ===
export async function getGendersApi(): Promise<Gender[]> {
  const res = await apiClient.get<any[]>('/catalog/genders')
  const data = Array.isArray(res.data) ? res.data : []
  return data.map((item) => ({
    ...item,
    name: item.name ?? item.name_gender ?? item.gender_name ?? '',
  }))
}

export async function createGenderApi(body: Omit<Gender, 'id'>): Promise<Gender> {
  const payload = {
    ...body,
    name_gender: body.name || (body as any).name_gender,
  }
  const res = await apiClient.post<any>('/catalog/genders', payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_gender ?? body.name ?? '',
  }
}

export async function updateGenderApi(id: string, body: Omit<Gender, 'id'>): Promise<Gender> {
  const payload = {
    ...body,
    name_gender: body.name || (body as any).name_gender,
  }
  const res = await apiClient.put<any>(`/catalog/genders/${id}`, payload)
  return {
    ...res.data,
    name: res.data?.name ?? res.data?.name_gender ?? body.name ?? '',
  }
}

export async function deleteGenderApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/genders/${id}`)
}
