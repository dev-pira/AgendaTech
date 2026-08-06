import * as mock from '@/mocks/auth.mock';
import { MOCK_ENABLED, request } from '@/services/http';
import type { AuthResponse } from '@/types/api';

export function registrar(dados: { nome: string; email: string; senha: string }) {
  if (MOCK_ENABLED) return mock.registrar(dados);
  return request<AuthResponse>('/auth/registro', { method: 'POST', body: dados, auth: false });
}

export function login(dados: { email: string; senha: string }) {
  if (MOCK_ENABLED) return mock.login(dados);
  return request<AuthResponse>('/auth/login', { method: 'POST', body: dados, auth: false });
}

export function eu() {
  if (MOCK_ENABLED) return mock.eu();
  return request<{ usuario: AuthResponse['usuario'] }>('/auth/eu');
}
