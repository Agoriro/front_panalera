export interface Role {
  id_role: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface User {
  id_user: string;
  user: string;       // username in backend
  id_role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined field returned by some endpoints
  role?: Role;
}

export interface UserFormInput {
  user: string;       // matches backend field name
  password?: string;
  id_role: string;    // UUID of the role
  is_active: boolean;
}
