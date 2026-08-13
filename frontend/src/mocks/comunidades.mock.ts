import { HttpError } from '@/services/http';
import type {
  Comunidade,
  ComunidadeInput,
  Evento,
  ListaResponse,
  Membro,
  PapelMembro,
} from '@/types/api';

import { exigirAutenticacao } from './auth.mock';
import { comunidades, eventos, membros, usuarios, uuid } from './db';
import { delay, paginar } from './utils';

function contarMembros(comunidadeId: string) {
  return membros.filter((m) => m.comunidade_id === comunidadeId).length;
}

function serializar(comunidade: Comunidade): Comunidade {
  return { ...comunidade, total_membros: contarMembros(comunidade.id) };
}

export async function listarComunidades(params: {
  cidade?: string;
  pagina?: number;
  limite?: number;
}): Promise<ListaResponse<Comunidade>> {
  await delay();
  const filtradas = comunidades
    .filter((c) => !params.cidade || c.cidade.toLowerCase() === params.cidade.toLowerCase())
    .map(serializar)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  return paginar(filtradas, params.pagina, params.limite);
}

export async function buscarComunidade(id: string): Promise<Comunidade> {
  await delay();
  const comunidade = comunidades.find((c) => c.id === id);
  if (!comunidade) throw new HttpError(404, 'Comunidade não encontrada [mock]');
  return serializar(comunidade);
}

export async function criarComunidade(dados: ComunidadeInput): Promise<Comunidade> {
  await delay();
  const usuario = exigirAutenticacao();
  if (comunidades.some((c) => c.nome.toLowerCase() === dados.nome.toLowerCase())) {
    throw new HttpError(409, 'Já existe uma comunidade com esse nome [mock]');
  }
  const agora = new Date().toISOString();
  const comunidade: Comunidade = {
    id: uuid(),
    nome: dados.nome,
    descricao: dados.descricao,
    cidade: dados.cidade,
    contato: dados.contato,
    logo_url: dados.logo_url ?? null,
    criado_em: agora,
    atualizado_em: agora,
    criado_por: { id: usuario.id, nome: usuario.nome },
  };
  comunidades.push(comunidade);
  // RN-COM-08: criador é auto-atribuído como organizador
  membros.push({
    comunidade_id: comunidade.id,
    usuario_id: usuario.id,
    papel: 'organizador',
    adicionado_em: agora,
    adicionado_por: usuario.id,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
  return serializar(comunidade);
}

export async function atualizarComunidade(
  id: string,
  dados: Partial<ComunidadeInput>,
): Promise<Comunidade> {
  await delay();
  const usuario = exigirAutenticacao();
  const comunidade = comunidades.find((c) => c.id === id);
  if (!comunidade) throw new HttpError(404, 'Comunidade não encontrada [mock]');
  // RN-COM-07: só o criador pode editar
  if (comunidade.criado_por?.id !== usuario.id) {
    throw new HttpError(403, 'Apenas o criador da comunidade pode editá-la [mock]');
  }
  Object.assign(comunidade, dados, { atualizado_em: new Date().toISOString() });
  return serializar(comunidade);
}

export async function excluirComunidade(id: string): Promise<void> {
  await delay();
  const usuario = exigirAutenticacao();
  const indice = comunidades.findIndex((c) => c.id === id);
  if (indice === -1) throw new HttpError(404, 'Comunidade não encontrada [mock]');
  const comunidade = comunidades[indice];
  if (comunidade.criado_por?.id !== usuario.id) {
    throw new HttpError(403, 'Apenas o criador da comunidade pode excluí-la [mock]');
  }
  const hoje = new Date().toISOString().slice(0, 10);
  // RN-COM-10: não pode excluir com eventos futuros agendados
  const temEventosFuturos = eventos.some((e) => e.comunidade_id === id && e.data >= hoje);
  if (temEventosFuturos) {
    throw new HttpError(
      422,
      'Não é possível excluir uma comunidade com eventos futuros agendados [mock]',
    );
  }
  comunidades.splice(indice, 1);
}

export async function listarEventosDaComunidade(
  id: string,
  params: { pagina?: number; limite?: number } = {},
): Promise<ListaResponse<Evento>> {
  await delay();
  if (!comunidades.some((c) => c.id === id)) {
    throw new HttpError(404, 'Comunidade não encontrada [mock]');
  }
  const filtrados = eventos
    .filter((e) => e.comunidade_id === id)
    .sort((a, b) => a.data.localeCompare(b.data) || a.hora_inicio.localeCompare(b.hora_inicio));
  return paginar(filtrados, params.pagina, params.limite);
}

export async function listarMembros(
  id: string,
  params: { papel?: PapelMembro; pagina?: number; limite?: number } = {},
): Promise<ListaResponse<Membro>> {
  await delay();
  exigirAutenticacao();
  if (!comunidades.some((c) => c.id === id)) {
    throw new HttpError(404, 'Comunidade não encontrada [mock]');
  }
  const filtrados = membros
    .filter((m) => m.comunidade_id === id && (!params.papel || m.papel === params.papel))
    .sort((a, b) => a.adicionado_em.localeCompare(b.adicionado_em));
  return paginar(filtrados, params.pagina, params.limite);
}

function exigirOrganizador(comunidadeId: string, usuarioId: string) {
  const membro = membros.find(
    (m) => m.comunidade_id === comunidadeId && m.usuario_id === usuarioId,
  );
  if (!membro || membro.papel !== 'organizador') {
    throw new HttpError(403, 'Apenas organizadores podem gerenciar membros [mock]');
  }
}

function contarOrganizadores(comunidadeId: string) {
  return membros.filter((m) => m.comunidade_id === comunidadeId && m.papel === 'organizador')
    .length;
}

export async function adicionarMembro(
  id: string,
  dados: { email: string; papel: PapelMembro },
): Promise<Membro> {
  await delay();
  const requisitante = exigirAutenticacao();
  if (!comunidades.some((c) => c.id === id)) {
    throw new HttpError(404, 'Comunidade não encontrada [mock]');
  }
  exigirOrganizador(id, requisitante.id);

  const alvo = usuarios.find((u) => u.email.toLowerCase() === dados.email.toLowerCase());
  if (!alvo) throw new HttpError(404, 'Nenhum usuário cadastrado com esse email [mock]');
  if (membros.some((m) => m.comunidade_id === id && m.usuario_id === alvo.id)) {
    throw new HttpError(409, 'Usuário já é membro dessa comunidade [mock]');
  }

  const membro: Membro = {
    comunidade_id: id,
    usuario_id: alvo.id,
    papel: dados.papel,
    adicionado_em: new Date().toISOString(),
    adicionado_por: requisitante.id,
    usuario: { id: alvo.id, nome: alvo.nome, email: alvo.email },
  };
  membros.push(membro);
  return membro;
}

export async function atualizarPapelMembro(
  id: string,
  usuarioId: string,
  papel: PapelMembro,
): Promise<Membro> {
  await delay();
  const requisitante = exigirAutenticacao();
  exigirOrganizador(id, requisitante.id);

  const membro = membros.find((m) => m.comunidade_id === id && m.usuario_id === usuarioId);
  if (!membro) throw new HttpError(404, 'Membro não encontrado nessa comunidade [mock]');

  // RN-ORG-01: sempre precisa sobrar ao menos 1 organizador
  if (membro.papel === 'organizador' && papel === 'membro' && contarOrganizadores(id) <= 1) {
    throw new HttpError(422, 'Não é possível remover o último organizador da comunidade [mock]');
  }
  membro.papel = papel;
  return membro;
}

export async function removerMembro(id: string, usuarioId: string): Promise<void> {
  await delay();
  const requisitante = exigirAutenticacao();
  exigirOrganizador(id, requisitante.id);

  const indice = membros.findIndex((m) => m.comunidade_id === id && m.usuario_id === usuarioId);
  if (indice === -1) throw new HttpError(404, 'Membro não encontrado nessa comunidade [mock]');
  const membro = membros[indice];
  if (membro.papel === 'organizador' && contarOrganizadores(id) <= 1) {
    throw new HttpError(422, 'Não é possível remover o último organizador da comunidade [mock]');
  }
  membros.splice(indice, 1);
}
