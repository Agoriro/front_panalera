export interface Supplier {
  id: string;
  name_supplier?: string;
  name?: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name?: string;
  name_category?: string;
  category_name?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Color {
  id: string;
  name?: string;
  name_color?: string;
  color_name?: string;
  hex_value?: string;
  hex_color?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Size {
  id: string;
  name?: string;
  name_size?: string;
  size_name?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Gender {
  id: string;
  name?: string;
  name_gender?: string;
  gender_name?: string;
  is_active: boolean;
  created_at?: string;
}
