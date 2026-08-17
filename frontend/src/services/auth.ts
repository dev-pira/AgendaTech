import * as mock from '@/mocks/auth.mock';
import { MOCK_ENABLED, request } from '@/services/http';
import type { AuthResponse, CadastroInput } from '@/types/api';

export function registrar(dados: CadastroInput) {
  if (MOCK_ENABLED) return mock.registrar(dados);
  // POST /api/cadastro (App\Http\Controllers\Api\AuthController::cadastro)
  // - antes o front chamava /auth/registro, que nunca existiu no Laravel
  // (contrato da versao Node antiga). Ver issue #73.
  return request<AuthResponse>('/cadastro', { method: 'POST', body: dados, auth: false });
}

export function login(dados: { username: string; password: string }) {
  if (MOCK_ENABLED) return mock.login(dados);
  // O backend real (App\Http\Controllers\Api\AuthController::obterToken) e
  // POST /api/auth/token com { username, password } - nao /auth/login com
  // { email, senha }. Ver issue #93: o contrato anterior aqui era o da
  // versao Node antiga (backend/src, removida), nunca existiu no Laravel.
  return request<AuthResponse>('/auth/token', { method: 'POST', body: dados, auth: false });
}

export function eu() {
  if (MOCK_ENABLED) return mock.eu();
  return request<{ usuario: AuthResponse['usuario'] }>('/auth/eu');
}
