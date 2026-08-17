import type { CalendarioResponse, TipoEvento } from '@/types/api';

import { eventos } from './db';
import { delay } from './utils';

export interface FiltrosCalendarioMock {
  data_inicio: string;
  data_fim: string;
  comunidade_id?: string;
  cidade?: string;
  tipo?: TipoEvento;
}

export async function buscarCalendario(params: FiltrosCalendarioMock): Promise<CalendarioResponse> {
  await delay();
  const filtrados = eventos
    .filter((e) => e.data >= params.data_inicio && e.data <= params.data_fim)
    .filter((e) => !params.comunidade_id || e.comunidade_id === params.comunidade_id)
    .filter((e) => !params.tipo || e.tipo === params.tipo)
    .filter(
      (e) =>
        !params.cidade || (e.comunidade.cidade ?? '').toLowerCase() === params.cidade.toLowerCase(),
    );

  return {
    eventos: filtrados,
    total: filtrados.length,
    periodo: { data_inicio: params.data_inicio, data_fim: params.data_fim },
  };
}
