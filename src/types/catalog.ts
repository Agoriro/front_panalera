// Tipos base para Catálogos Simples (Categorías, Colores, Tallas, Géneros)
export interface BasicCatalogItem {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Category extends BasicCatalogItem {
  id_category?: string;
  name_category?: string;
  category_name?: string;
}

export interface Color extends BasicCatalogItem {
  id_color?: string;
  name_color?: string;
  color_name?: string;
  hex_value?: string;
  hex_color?: string;
}

export interface Size extends BasicCatalogItem {
  id_size?: string;
  name_size?: string;
  size_name?: string;
}

export interface Gender extends BasicCatalogItem {
  id_gender?: string;
  name_gender?: string;
  gender_name?: string;
}

// Tipos para Proveedores
export interface Supplier {
  id: string;
  id_supplier?: string;
  name?: string;
  name_supplier: string;
  address?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

