import { request, type QueryParams } from '@/services/http';
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
  return request<ListaResponse<Evento>>('/eventos', {
    query: params as QueryParams,
    auth: false,
  });
}

export function buscarEvento(id: string) {
  return request<Evento>(`/eventos/${id}`, { auth: false });
}

export function criarEvento(dados: EventoInput) {
  return request<Evento>('/eventos', { method: 'POST', body: dados });
}

export function atualizarEvento(id: string, dados: Partial<EventoInput>) {
  return request<Evento>(`/eventos/${id}`, { method: 'PUT', body: dados });
}

export function excluirEvento(id: string) {
  return request<void>(`/eventos/${id}`, { method: 'DELETE' });
}
