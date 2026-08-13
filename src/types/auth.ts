export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}
