export interface Usuario {
  id_usuario: number;
  username: string;
  nombre_completo: string;
  rol: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  usuario: Usuario;
}
