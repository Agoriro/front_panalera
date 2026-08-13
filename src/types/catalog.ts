export interface Supplier {
  id: string;
  name_supplier: string;
  address: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface Color {
  id: string;
  name: string;
  hex_value?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Size {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface Gender {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}
