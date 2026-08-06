import { request, type QueryParams } from '@/services/http';
import type {
  Comunidade,
  ComunidadeInput,
  Evento,
  ListaResponse,
  Membro,
  PapelMembro,
} from '@/types/api';

export function listarComunidades(params: { cidade?: string; pagina?: number; limite?: number }) {
  return request<ListaResponse<Comunidade>>('/comunidades', {
    query: params as QueryParams,
    auth: false,
  });
}

export function buscarComunidade(id: string) {
  return request<Comunidade>(`/comunidades/${id}`, { auth: false });
}

export function criarComunidade(dados: ComunidadeInput) {
  return request<Comunidade>('/comunidades', { method: 'POST', body: dados });
}

export function atualizarComunidade(id: string, dados: Partial<ComunidadeInput>) {
  return request<Comunidade>(`/comunidades/${id}`, { method: 'PUT', body: dados });
}

export function excluirComunidade(id: string) {
  return request<void>(`/comunidades/${id}`, { method: 'DELETE' });
}

export function listarEventosDaComunidade(
  id: string,
  params: { pagina?: number; limite?: number } = {},
) {
  return request<ListaResponse<Evento>>(`/comunidades/${id}/eventos`, {
    query: params as QueryParams,
    auth: false,
  });
}

export function listarMembros(id: string, params: { papel?: PapelMembro } = {}) {
  return request<ListaResponse<Membro>>(`/comunidades/${id}/membros`, {
    query: params as QueryParams,
  });
}

export function adicionarMembro(id: string, dados: { email: string; papel: PapelMembro }) {
  return request<Membro>(`/comunidades/${id}/membros`, { method: 'POST', body: dados });
}

export function atualizarPapelMembro(id: string, usuarioId: string, papel: PapelMembro) {
  return request<Membro>(`/comunidades/${id}/membros/${usuarioId}/papel`, {
    method: 'PATCH',
    body: { papel },
  });
}

export function removerMembro(id: string, usuarioId: string) {
  return request<void>(`/comunidades/${id}/membros/${usuarioId}`, { method: 'DELETE' });
}
