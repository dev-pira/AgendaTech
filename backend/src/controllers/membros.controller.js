const asyncHandler = require('../utils/asyncHandler');
const membrosService = require('../services/membros.service');

const listar = asyncHandler(async (req, res) => {
  const resultado = await membrosService.listar(req.params.id, req.query);
  res.status(200).json(resultado);
});

const adicionar = asyncHandler(async (req, res) => {
  const membro = await membrosService.adicionar(req.params.id, req.body, req.usuario.id);
  res.status(201).json(membro);
});

const atualizarPapel = asyncHandler(async (req, res) => {
  const membro = await membrosService.atualizarPapel(
    req.params.id,
    req.params.usuario_id,
    req.body.papel,
    req.usuario.id,
  );
  res.status(200).json(membro);
});

const remover = asyncHandler(async (req, res) => {
  await membrosService.remover(req.params.id, req.params.usuario_id, req.usuario.id);
  res.status(204).send();
});

module.exports = { listar, adicionar, atualizarPapel, remover };
