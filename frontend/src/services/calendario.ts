import * as mock from '@/mocks/calendario.mock';
import { MOCK_ENABLED, request, type QueryParams } from '@/services/http';
import type { CalendarioResponse, TipoEvento } from '@/types/api';

export interface FiltrosCalendario {
  data_inicio: string;
  data_fim: string;
  comunidade_id?: string;
  cidade?: string;
  tipo?: TipoEvento;
}

export function buscarCalendario(params: FiltrosCalendario) {
  if (MOCK_ENABLED) return mock.buscarCalendario(params);
  return request<CalendarioResponse>('/calendario', {
    query: params as unknown as QueryParams,
    auth: false,
  });
}
