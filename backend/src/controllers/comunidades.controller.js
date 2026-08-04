const asyncHandler = require('../utils/asyncHandler');
const comunidadesService = require('../services/comunidades.service');

const listar = asyncHandler(async (req, res) => {
  const resultado = await comunidadesService.listar(req.query);
  res.status(200).json(resultado);
});

const buscar = asyncHandler(async (req, res) => {
  const comunidade = await comunidadesService.buscarPorId(req.params.id);
  res.status(200).json(comunidade);
});

const criar = asyncHandler(async (req, res) => {
  const comunidade = await comunidadesService.criar(req.body, req.usuario.id);
  res.status(201).json(comunidade);
});

const atualizar = asyncHandler(async (req, res) => {
  const comunidade = await comunidadesService.atualizar(req.params.id, req.body, req.usuario.id);
  res.status(200).json(comunidade);
});

const deletar = asyncHandler(async (req, res) => {
  await comunidadesService.deletar(req.params.id, req.usuario.id);
  res.status(204).send();
});

module.exports = { listar, buscar, criar, atualizar, deletar };
