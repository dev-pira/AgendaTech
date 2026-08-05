const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

function serializar(evento) {
  return {
    id: evento.id,
    titulo: evento.titulo,
    descricao: evento.descricao,
    data: evento.data.toISOString().slice(0, 10),
    hora_inicio: evento.horaInicio,
    hora_fim: evento.horaFim,
    local: evento.local,
    tipo: evento.tipo,
    url_online: evento.urlOnline,
    comunidade_id: evento.comunidadeId,
    organizador_id: evento.organizadorId,
    criado_em: evento.criadoEm,
    atualizado_em: evento.atualizadoEm,
    ...(evento.comunidade
      ? { comunidade: { id: evento.comunidade.id, nome: evento.comunidade.nome, cidade: evento.comunidade.cidade } }
      : {}),
  };
}

function hojeSemHora() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

async function membroDaComunidade(comunidadeId, usuarioId) {
  return prisma.comunidadeMembro.findUnique({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId } },
  });
}

function montarFiltros({ comunidade_id, cidade, data_inicio, data_fim, tipo }) {
  const where = {};
  if (comunidade_id) where.comunidadeId = comunidade_id;
  if (tipo) where.tipo = tipo;
  if (cidade) where.comunidade = { cidade: { equals: cidade, mode: 'insensitive' } };
  if (data_inicio || data_fim) {
    where.data = {};
    if (data_inicio) where.data.gte = new Date(data_inicio);
    if (data_fim) where.data.lte = new Date(data_fim);
  }
  return where;
}

async function listar(filtros) {
  const { pagina, limite } = filtros;
  const where = montarFiltros(filtros);

  const [itens, total] = await Promise.all([
    prisma.evento.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
      include: { comunidade: { select: { id: true, nome: true, cidade: true } } },
    }),
    prisma.evento.count({ where }),
  ]);

  return {
    dados: itens.map(serializar),
    paginacao: { pagina, limite, total, total_paginas: Math.ceil(total / limite) || 1 },
  };
}

async function listarPorComunidade(comunidadeId, { pagina, limite }) {
  const comunidade = await prisma.comunidade.findUnique({ where: { id: comunidadeId } });
  if (!comunidade) throw new ApiError(404, 'Comunidade não encontrada');
  return listar({ comunidade_id: comunidadeId, pagina, limite });
}

async function buscarPorIdOuFalhar(id) {
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: { comunidade: { select: { id: true, nome: true, cidade: true } } },
  });
  if (!evento) throw new ApiError(404, 'Evento não encontrado');
  return evento;
}

async function buscarPorId(id) {
  return serializar(await buscarPorIdOuFalhar(id));
}

async function criar(dados, usuarioId) {
  const comunidade = await prisma.comunidade.findUnique({ where: { id: dados.comunidade_id } });
  if (!comunidade) throw new ApiError(404, 'Comunidade não encontrada');

  // RN-EVT-09: só membros da comunidade podem criar eventos nela
  const membro = await membroDaComunidade(dados.comunidade_id, usuarioId);
  if (!membro) {
    throw new ApiError(403, 'Você precisa ser membro da comunidade para criar eventos nela');
  }

  // RN-EVT-08: sem título duplicado na mesma comunidade/data
  const duplicado = await prisma.evento.findFirst({
    where: {
      comunidadeId: dados.comunidade_id,
      data: new Date(dados.data),
      titulo: { equals: dados.titulo, mode: 'insensitive' },
    },
  });
  if (duplicado) {
    throw new ApiError(409, 'Já existe um evento com esse título nessa comunidade e data');
  }

  const evento = await prisma.evento.create({
    data: {
      titulo: dados.titulo,
      descricao: dados.descricao,
      data: new Date(dados.data),
      horaInicio: dados.hora_inicio,
      horaFim: dados.hora_fim,
      local: dados.local,
      tipo: dados.tipo,
      urlOnline: dados.url_online,
      comunidadeId: dados.comunidade_id,
      organizadorId: usuarioId,
    },
    include: { comunidade: { select: { id: true, nome: true, cidade: true } } },
  });

  return serializar(evento);
}

async function exigirOrganizadorDaComunidade(comunidadeId, usuarioId, acao) {
  const membro = await membroDaComunidade(comunidadeId, usuarioId);
  if (!membro || membro.papel !== 'organizador') {
    throw new ApiError(403, `Apenas organizadores da comunidade podem ${acao} eventos`);
  }
}

async function atualizar(id, dados, usuarioId) {
  const evento = await buscarPorIdOuFalhar(id);

  await exigirOrganizadorDaComunidade(evento.comunidadeId, usuarioId, 'editar');

  // RN-EVT-10: eventos passados não podem ser editados
  if (evento.data < hojeSemHora()) {
    throw new ApiError(422, 'Eventos passados não podem ser editados');
  }

  const horaInicio = dados.hora_inicio ?? evento.horaInicio;
  const horaFim = dados.hora_fim ?? evento.horaFim;
  if (horaFim && horaFim <= horaInicio) {
    throw new ApiError(400, 'hora_fim deve ser depois de hora_inicio');
  }

  const tipo = dados.tipo ?? evento.tipo;
  const urlOnline = dados.url_online ?? evento.urlOnline;
  if (tipo !== 'presencial' && !urlOnline) {
    throw new ApiError(400, 'url_online é obrigatória quando tipo é online ou hibrido');
  }

  const novaData = dados.data ? new Date(dados.data) : evento.data;
  if (novaData < hojeSemHora()) {
    throw new ApiError(400, 'data deve ser hoje ou futura');
  }

  const atualizado = await prisma.evento.update({
    where: { id },
    data: {
      ...(dados.titulo !== undefined ? { titulo: dados.titulo } : {}),
      ...(dados.descricao !== undefined ? { descricao: dados.descricao } : {}),
      ...(dados.data !== undefined ? { data: novaData } : {}),
      ...(dados.hora_inicio !== undefined ? { horaInicio: dados.hora_inicio } : {}),
      ...(dados.hora_fim !== undefined ? { horaFim: dados.hora_fim } : {}),
      ...(dados.local !== undefined ? { local: dados.local } : {}),
      ...(dados.tipo !== undefined ? { tipo: dados.tipo } : {}),
      ...(dados.url_online !== undefined ? { urlOnline: dados.url_online } : {}),
    },
    include: { comunidade: { select: { id: true, nome: true, cidade: true } } },
  });

  return serializar(atualizado);
}

async function deletar(id, usuarioId) {
  const evento = await buscarPorIdOuFalhar(id);

  await exigirOrganizadorDaComunidade(evento.comunidadeId, usuarioId, 'excluir');

  if (evento.data < hojeSemHora()) {
    throw new ApiError(422, 'Eventos passados não podem ser excluídos');
  }

  await prisma.evento.delete({ where: { id } });
}

module.exports = {
  listar,
  listarPorComunidade,
  buscarPorId,
  criar,
  atualizar,
  deletar,
  serializar,
  montarFiltros,
};
