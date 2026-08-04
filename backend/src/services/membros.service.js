const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

function serializar(membro) {
  return {
    comunidade_id: membro.comunidadeId,
    usuario_id: membro.usuarioId,
    papel: membro.papel,
    adicionado_em: membro.adicionadoEm,
    adicionado_por: membro.adicionadoPor,
    ...(membro.usuario
      ? { usuario: { id: membro.usuario.id, nome: membro.usuario.nome, email: membro.usuario.email } }
      : {}),
  };
}

async function exigirOrganizador(comunidadeId, usuarioId) {
  const membro = await prisma.comunidadeMembro.findUnique({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId } },
  });
  if (!membro || membro.papel !== 'organizador') {
    throw new ApiError(403, 'Apenas organizadores da comunidade podem gerenciar membros');
  }
}

async function contarOrganizadores(comunidadeId) {
  return prisma.comunidadeMembro.count({ where: { comunidadeId, papel: 'organizador' } });
}

async function listar(comunidadeId, { papel, pagina, limite }) {
  const comunidade = await prisma.comunidade.findUnique({ where: { id: comunidadeId } });
  if (!comunidade) throw new ApiError(404, 'Comunidade não encontrada');

  const where = { comunidadeId, ...(papel ? { papel } : {}) };
  const [itens, total] = await Promise.all([
    prisma.comunidadeMembro.findMany({
      where,
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { adicionadoEm: 'asc' },
      include: { usuario: { select: { id: true, nome: true, email: true } } },
    }),
    prisma.comunidadeMembro.count({ where }),
  ]);

  return {
    dados: itens.map(serializar),
    paginacao: { pagina, limite, total, total_paginas: Math.ceil(total / limite) || 1 },
  };
}

async function adicionar(comunidadeId, { email, papel }, requisitanteId) {
  const comunidade = await prisma.comunidade.findUnique({ where: { id: comunidadeId } });
  if (!comunidade) throw new ApiError(404, 'Comunidade não encontrada');

  await exigirOrganizador(comunidadeId, requisitanteId);

  // RN-ORG-04: email deve corresponder a um usuário existente
  const usuarioAlvo = await prisma.usuario.findUnique({ where: { email } });
  if (!usuarioAlvo) {
    throw new ApiError(404, 'Nenhum usuário cadastrado com esse email');
  }

  const jaMembro = await prisma.comunidadeMembro.findUnique({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId: usuarioAlvo.id } },
  });
  if (jaMembro) {
    throw new ApiError(409, 'Usuário já é membro dessa comunidade');
  }

  const membro = await prisma.comunidadeMembro.create({
    data: { comunidadeId, usuarioId: usuarioAlvo.id, papel, adicionadoPor: requisitanteId },
    include: { usuario: { select: { id: true, nome: true, email: true } } },
  });

  return serializar(membro);
}

async function atualizarPapel(comunidadeId, usuarioIdAlvo, papel, requisitanteId) {
  await exigirOrganizador(comunidadeId, requisitanteId);

  const membro = await prisma.comunidadeMembro.findUnique({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId: usuarioIdAlvo } },
  });
  if (!membro) throw new ApiError(404, 'Membro não encontrado nessa comunidade');

  // RN-ORG-01: sempre precisa sobrar ao menos 1 organizador
  if (membro.papel === 'organizador' && papel === 'membro') {
    const totalOrganizadores = await contarOrganizadores(comunidadeId);
    if (totalOrganizadores <= 1) {
      throw new ApiError(422, 'Não é possível remover o último organizador da comunidade');
    }
  }

  const atualizado = await prisma.comunidadeMembro.update({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId: usuarioIdAlvo } },
    data: { papel },
    include: { usuario: { select: { id: true, nome: true, email: true } } },
  });

  return serializar(atualizado);
}

async function remover(comunidadeId, usuarioIdAlvo, requisitanteId) {
  await exigirOrganizador(comunidadeId, requisitanteId);

  const membro = await prisma.comunidadeMembro.findUnique({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId: usuarioIdAlvo } },
  });
  if (!membro) throw new ApiError(404, 'Membro não encontrado nessa comunidade');

  if (membro.papel === 'organizador') {
    const totalOrganizadores = await contarOrganizadores(comunidadeId);
    if (totalOrganizadores <= 1) {
      throw new ApiError(422, 'Não é possível remover o último organizador da comunidade');
    }
  }

  await prisma.comunidadeMembro.delete({
    where: { comunidadeId_usuarioId: { comunidadeId, usuarioId: usuarioIdAlvo } },
  });
}

module.exports = { listar, adicionar, atualizarPapel, remover, serializar };
