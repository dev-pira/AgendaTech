import * as mock from '@/mocks/comunidades.mock';
import { MOCK_ENABLED, request, type QueryParams } from '@/services/http';
import type {
  Comunidade,
  ComunidadeInput,
  Evento,
  ListaResponse,
  Membro,
  PapelMembro,
} from '@/types/api';

export function listarComunidades(params: {
  busca?: string;
  cidade?: string;
  pagina?: number;
  limite?: number;
}) {
  if (MOCK_ENABLED) return mock.listarComunidades(params);
  return request<ListaResponse<Comunidade>>('/comunidades', {
    query: params as QueryParams,
    auth: false,
  });
}

export function buscarComunidade(id: string) {
  if (MOCK_ENABLED) return mock.buscarComunidade(id);
  return request<Comunidade>(`/comunidades/${id}`, { auth: false });
}

export function criarComunidade(dados: ComunidadeInput) {
  if (MOCK_ENABLED) return mock.criarComunidade(dados);
  return request<Comunidade>('/comunidades', { method: 'POST', body: dados });
}

export function atualizarComunidade(id: string, dados: Partial<ComunidadeInput>) {
  if (MOCK_ENABLED) return mock.atualizarComunidade(id, dados);
  return request<Comunidade>(`/comunidades/${id}`, { method: 'PUT', body: dados });
}

export function excluirComunidade(id: string) {
  if (MOCK_ENABLED) return mock.excluirComunidade(id);
  return request<void>(`/comunidades/${id}`, { method: 'DELETE' });
}

export function listarEventosDaComunidade(
  id: string,
  params: { pagina?: number; limite?: number } = {},
) {
  if (MOCK_ENABLED) return mock.listarEventosDaComunidade(id, params);
  return request<ListaResponse<Evento>>(`/comunidades/${id}/eventos`, {
    query: params as QueryParams,
    auth: false,
  });
}

export function listarMembros(id: string, params: { papel?: PapelMembro } = {}) {
  if (MOCK_ENABLED) return mock.listarMembros(id, params);
  return request<ListaResponse<Membro>>(`/comunidades/${id}/membros`, {
    query: params as QueryParams,
  });
}

export function adicionarMembro(id: string, dados: { email: string; papel: PapelMembro }) {
  if (MOCK_ENABLED) return mock.adicionarMembro(id, dados);
  return request<Membro>(`/comunidades/${id}/membros`, { method: 'POST', body: dados });
}

export function atualizarPapelMembro(id: string, usuarioId: string, papel: PapelMembro) {
  if (MOCK_ENABLED) return mock.atualizarPapelMembro(id, usuarioId, papel);
  return request<Membro>(`/comunidades/${id}/membros/${usuarioId}/papel`, {
    method: 'PATCH',
    body: { papel },
  });
}

export function removerMembro(id: string, usuarioId: string) {
  if (MOCK_ENABLED) return mock.removerMembro(id, usuarioId);
  return request<void>(`/comunidades/${id}/membros/${usuarioId}`, { method: 'DELETE' });
}
