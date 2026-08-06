import { request } from '@/services/http';
import type { AuthResponse } from '@/types/api';

export function registrar(dados: { nome: string; email: string; senha: string }) {
  return request<AuthResponse>('/auth/registro', { method: 'POST', body: dados, auth: false });
}

export function login(dados: { email: string; senha: string }) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: dados, auth: false });
}

export function eu() {
  return request<{ usuario: AuthResponse['usuario'] }>('/auth/eu');
}
