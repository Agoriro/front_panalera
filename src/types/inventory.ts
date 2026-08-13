import { Supplier, Category, Color, Size, Gender } from './catalog';

export interface InventoryItem {
  id: string;
  description: string;
  code_inventory?: string | null;
  barcode_inventory?: string | null;
  utility: number;
  stock_qty: number;
  photo_url?: string | null;
  id_supplier: string;
  id_category: string;
  id_color: string;
  id_size: string;
  id_gender: string;
  cost_price?: number;
  supplier?: Supplier;
  category?: Category;
  color?: Color;
  size?: Size;
  gender?: Gender;
  photos?: Array<{ id_reg: string; url_photo: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryFormInput {
  description: string;
  code_inventory?: string | null;
  barcode_inventory?: string | null;
  utility: number;
  id_supplier: string;
  id_category: string;
  id_color: string;
  id_size: string;
  id_gender: string;
  photo_url?: string | null;
}

export interface InventoryQueryParams {
  search?: string;
  code_inventory?: string;
  barcode_inventory?: string;
}

