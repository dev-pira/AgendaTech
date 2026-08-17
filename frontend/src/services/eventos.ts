import * as mock from '@/mocks/eventos.mock';
import { MOCK_ENABLED, request, type QueryParams } from '@/services/http';
import type { Evento, EventoInput, ListaResponse, TipoEvento } from '@/types/api';

export interface FiltrosEventos {
  comunidade_id?: string;
  cidade?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?: TipoEvento;
  pagina?: number;
  limite?: number;
}

export function listarEventos(params: FiltrosEventos = {}) {
  if (MOCK_ENABLED) return mock.listarEventos(params);
  return request<ListaResponse<Evento>>('/eventos', {
    query: params as QueryParams,
    auth: false,
  });
}

export function buscarEvento(id: string) {
  if (MOCK_ENABLED) return mock.buscarEvento(id);
  return request<Evento>(`/eventos/${id}`, { auth: false });
}

export function criarEvento(dados: EventoInput) {
  if (MOCK_ENABLED) return mock.criarEvento(dados);
  return request<Evento>('/eventos', { method: 'POST', body: dados });
}

export function atualizarEvento(id: string, dados: Partial<EventoInput>) {
  if (MOCK_ENABLED) return mock.atualizarEvento(id, dados);
  return request<Evento>(`/eventos/${id}`, { method: 'PUT', body: dados });
}

export function excluirEvento(id: string) {
  if (MOCK_ENABLED) return mock.excluirEvento(id);
  return request<void>(`/eventos/${id}`, { method: 'DELETE' });
}
