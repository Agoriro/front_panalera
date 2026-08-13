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
  const res = await apiClient.get<Category[]>('/catalog/categories')
  return res.data
}

export async function createCategoryApi(body: Omit<Category, 'id'>): Promise<Category> {
  const res = await apiClient.post<Category>('/catalog/categories', body)
  return res.data
}

export async function updateCategoryApi(id: string, body: Omit<Category, 'id'>): Promise<Category> {
  const res = await apiClient.put<Category>(`/catalog/categories/${id}`, body)
  return res.data
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/categories/${id}`)
}

// === COLORS ===
export async function getColorsApi(): Promise<Color[]> {
  const res = await apiClient.get<Color[]>('/catalog/colors')
  return res.data
}

export async function createColorApi(body: Omit<Color, 'id'>): Promise<Color> {
  const res = await apiClient.post<Color>('/catalog/colors', body)
  return res.data
}

export async function updateColorApi(id: string, body: Omit<Color, 'id'>): Promise<Color> {
  const res = await apiClient.put<Color>(`/catalog/colors/${id}`, body)
  return res.data
}

export async function deleteColorApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/colors/${id}`)
}

// === SIZES ===
export async function getSizesApi(): Promise<Size[]> {
  const res = await apiClient.get<Size[]>('/catalog/sizes')
  return res.data
}

export async function createSizeApi(body: Omit<Size, 'id'>): Promise<Size> {
  const res = await apiClient.post<Size>('/catalog/sizes', body)
  return res.data
}

export async function updateSizeApi(id: string, body: Omit<Size, 'id'>): Promise<Size> {
  const res = await apiClient.put<Size>(`/catalog/sizes/${id}`, body)
  return res.data
}

export async function deleteSizeApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/sizes/${id}`)
}

// === GENDERS ===
export async function getGendersApi(): Promise<Gender[]> {
  const res = await apiClient.get<Gender[]>('/catalog/genders')
  return res.data
}

export async function createGenderApi(body: Omit<Gender, 'id'>): Promise<Gender> {
  const res = await apiClient.post<Gender>('/catalog/genders', body)
  return res.data
}

export async function updateGenderApi(id: string, body: Omit<Gender, 'id'>): Promise<Gender> {
  const res = await apiClient.put<Gender>(`/catalog/genders/${id}`, body)
  return res.data
}

export async function deleteGenderApi(id: string): Promise<void> {
  await apiClient.delete(`/catalog/genders/${id}`)
}
