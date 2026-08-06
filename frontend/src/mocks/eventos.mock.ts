import { HttpError } from '@/services/http';
import type { Evento, EventoInput, ListaResponse, TipoEvento } from '@/types/api';

import { exigirAutenticacao } from './auth.mock';
import { comunidades, eventos, membros, uuid } from './db';
import { delay, paginar } from './utils';

export interface FiltrosEventosMock {
  comunidade_id?: string;
  cidade?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?: TipoEvento;
  pagina?: number;
  limite?: number;
}

function hojeYMD() {
  return new Date().toISOString().slice(0, 10);
}

function membroDaComunidade(comunidadeId: string, usuarioId: string) {
  return membros.find((m) => m.comunidade_id === comunidadeId && m.usuario_id === usuarioId);
}

export async function listarEventos(
  filtros: FiltrosEventosMock = {},
): Promise<ListaResponse<Evento>> {
  await delay();
  const filtrados = eventos
    .filter((e) => !filtros.comunidade_id || e.comunidade_id === filtros.comunidade_id)
    .filter((e) => !filtros.tipo || e.tipo === filtros.tipo)
    .filter(
      (e) => !filtros.cidade || e.comunidade?.cidade.toLowerCase() === filtros.cidade.toLowerCase(),
    )
    .filter((e) => !filtros.data_inicio || e.data >= filtros.data_inicio)
    .filter((e) => !filtros.data_fim || e.data <= filtros.data_fim)
    .sort((a, b) => a.data.localeCompare(b.data) || a.hora_inicio.localeCompare(b.hora_inicio));
  return paginar(filtrados, filtros.pagina, filtros.limite);
}

export async function buscarEvento(id: string): Promise<Evento> {
  await delay();
  const evento = eventos.find((e) => e.id === id);
  if (!evento) throw new HttpError(404, 'Evento não encontrado [mock]');
  return evento;
}

export async function criarEvento(dados: EventoInput): Promise<Evento> {
  await delay();
  const usuario = exigirAutenticacao();
  const comunidade = comunidades.find((c) => c.id === dados.comunidade_id);
  if (!comunidade) throw new HttpError(404, 'Comunidade não encontrada [mock]');

  // RN-EVT-07: só membros da comunidade podem criar eventos nela
  if (!membroDaComunidade(dados.comunidade_id, usuario.id)) {
    throw new HttpError(
      403,
      'Você precisa ser membro da comunidade para criar eventos nela [mock]',
    );
  }
  // RN-EVT-09: sem título duplicado na mesma comunidade/data
  if (
    eventos.some(
      (e) =>
        e.comunidade_id === dados.comunidade_id &&
        e.data === dados.data &&
        e.titulo.toLowerCase() === dados.titulo.toLowerCase(),
    )
  ) {
    throw new HttpError(409, 'Já existe um evento com esse título nessa comunidade e data [mock]');
  }

  const agora = new Date().toISOString();
  const evento: Evento = {
    id: uuid(),
    titulo: dados.titulo,
    descricao: dados.descricao,
    data: dados.data,
    hora_inicio: dados.hora_inicio,
    hora_fim: dados.hora_fim ?? null,
    local: dados.local,
    tipo: dados.tipo,
    url_online: dados.url_online ?? null,
    comunidade_id: dados.comunidade_id,
    organizador_id: usuario.id,
    criado_em: agora,
    atualizado_em: agora,
    comunidade: { id: comunidade.id, nome: comunidade.nome, cidade: comunidade.cidade },
  };
  eventos.push(evento);
  return evento;
}

function exigirOrganizadorDaComunidade(comunidadeId: string, usuarioId: string, acao: string) {
  const membro = membroDaComunidade(comunidadeId, usuarioId);
  if (!membro || membro.papel !== 'organizador') {
    throw new HttpError(403, `Apenas organizadores da comunidade podem ${acao} eventos [mock]`);
  }
}

export async function atualizarEvento(id: string, dados: Partial<EventoInput>): Promise<Evento> {
  await delay();
  const usuario = exigirAutenticacao();
  const evento = eventos.find((e) => e.id === id);
  if (!evento) throw new HttpError(404, 'Evento não encontrado [mock]');

  exigirOrganizadorDaComunidade(evento.comunidade_id, usuario.id, 'editar');

  // RN-EVT-10: eventos passados não podem ser editados
  if (evento.data < hojeYMD()) {
    throw new HttpError(422, 'Eventos passados não podem ser editados [mock]');
  }
  const horaInicio = dados.hora_inicio ?? evento.hora_inicio;
  const horaFim = dados.hora_fim ?? evento.hora_fim;
  if (horaFim && horaFim <= horaInicio) {
    throw new HttpError(400, 'hora_fim deve ser depois de hora_inicio [mock]');
  }
  const tipo = dados.tipo ?? evento.tipo;
  const urlOnline = dados.url_online ?? evento.url_online;
  if (tipo !== 'presencial' && !urlOnline) {
    throw new HttpError(400, 'url_online é obrigatória quando tipo é online ou hibrido [mock]');
  }

  Object.assign(evento, dados, { atualizado_em: new Date().toISOString() });
  return evento;
}

export async function excluirEvento(id: string): Promise<void> {
  await delay();
  const usuario = exigirAutenticacao();
  const indice = eventos.findIndex((e) => e.id === id);
  if (indice === -1) throw new HttpError(404, 'Evento não encontrado [mock]');
  const evento = eventos[indice];

  exigirOrganizadorDaComunidade(evento.comunidade_id, usuario.id, 'excluir');

  if (evento.data < hojeYMD()) {
    throw new HttpError(422, 'Eventos passados não podem ser excluídos [mock]');
  }
  eventos.splice(indice, 1);
}
