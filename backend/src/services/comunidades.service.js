const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

function serializar(comunidade) {
  return {
    id: comunidade.id,
    nome: comunidade.nome,
    descricao: comunidade.descricao,
    cidade: comunidade.cidade,
    contato: comunidade.contato,
    logo_url: comunidade.logoUrl,
    criado_em: comunidade.criadoEm,
    atualizado_em: comunidade.atualizadoEm,
    criado_por: comunidade.criadoPor,
    ...(comunidade._count ? { total_membros: comunidade._count.membros } : {}),
  };
}

async function garantirNomeDisponivel(nome, ignorarId) {
  const existente = await prisma.comunidade.findFirst({
    where: {
      nome: { equals: nome, mode: 'insensitive' },
      ...(ignorarId ? { NOT: { id: ignorarId } } : {}),
    },
  });
  if (existente) {
    throw new ApiError(409, 'Já existe uma comunidade com esse nome');
  }
}

async function listar({ cidade, pagina, limite }) {
  const where = cidade ? { cidade: { equals: cidade, mode: 'insensitive' } } : {};
  const [itens, total] = await Promise.all([
    prisma.comunidade.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { criadoEm: 'desc' },
      include: { _count: { select: { membros: true } } },
    }),
    prisma.comunidade.count({ where }),
  ]);

  return {
    dados: itens.map(serializar),
    paginacao: { pagina, limite, total, total_paginas: Math.ceil(total / limite) || 1 },
  };
}

async function buscarPorIdOuFalhar(id) {
  const comunidade = await prisma.comunidade.findUnique({
    where: { id },
    include: { _count: { select: { membros: true } } },
  });
  if (!comunidade) {
    throw new ApiError(404, 'Comunidade não encontrada');
  }
  return comunidade;
}

async function buscarPorId(id) {
  return serializar(await buscarPorIdOuFalhar(id));
}

async function criar(dados, usuarioId) {
  await garantirNomeDisponivel(dados.nome);

  const comunidade = await prisma.comunidade.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      cidade: dados.cidade,
      contato: dados.contato,
      logoUrl: dados.logo_url,
      criadoPor: usuarioId,
      // RN-COM-08: criador é auto-atribuído como organizador
      membros: {
        create: { usuarioId, papel: 'organizador', adicionadoPor: usuarioId },
      },
    },
    include: { _count: { select: { membros: true } } },
  });

  return serializar(comunidade);
}

async function atualizar(id, dados, usuarioId) {
  const comunidade = await buscarPorIdOuFalhar(id);

  // RN-COM-07: só o criador pode editar
  if (comunidade.criadoPor !== usuarioId) {
    throw new ApiError(403, 'Apenas o criador da comunidade pode editá-la');
  }

  if (dados.nome && dados.nome.toLowerCase() !== comunidade.nome.toLowerCase()) {
    await garantirNomeDisponivel(dados.nome, id);
  }

  const atualizada = await prisma.comunidade.update({
    where: { id },
    data: {
      ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
      ...(dados.descricao !== undefined ? { descricao: dados.descricao } : {}),
      ...(dados.cidade !== undefined ? { cidade: dados.cidade } : {}),
      ...(dados.contato !== undefined ? { contato: dados.contato } : {}),
      ...(dados.logo_url !== undefined ? { logoUrl: dados.logo_url } : {}),
    },
    include: { _count: { select: { membros: true } } },
  });

  return serializar(atualizada);
}

async function deletar(id, usuarioId) {
  const comunidade = await buscarPorIdOuFalhar(id);

  if (comunidade.criadoPor !== usuarioId) {
    throw new ApiError(403, 'Apenas o criador da comunidade pode excluí-la');
  }

  // RN-COM-10: não pode excluir se existirem eventos futuros
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const eventosFuturos = await prisma.evento.count({
    where: { comunidadeId: id, data: { gte: hoje } },
  });
  if (eventosFuturos > 0) {
    throw new ApiError(422, 'Não é possível excluir uma comunidade com eventos futuros agendados');
  }

  await prisma.comunidade.delete({ where: { id } });
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar, serializar };
