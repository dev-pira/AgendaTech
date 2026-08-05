const asyncHandler = require('../utils/asyncHandler');
const eventosService = require('../services/eventos.service');

const listar = asyncHandler(async (req, res) => {
  const resultado = await eventosService.listar(req.query);
  res.status(200).json(resultado);
});

const listarPorComunidade = asyncHandler(async (req, res) => {
  const resultado = await eventosService.listarPorComunidade(req.params.id, req.query);
  res.status(200).json(resultado);
});

const buscar = asyncHandler(async (req, res) => {
  const evento = await eventosService.buscarPorId(req.params.id);
  res.status(200).json(evento);
});

const criar = asyncHandler(async (req, res) => {
  const evento = await eventosService.criar(req.body, req.usuario.id);
  res.status(201).json(evento);
});

const atualizar = asyncHandler(async (req, res) => {
  const evento = await eventosService.atualizar(req.params.id, req.body, req.usuario.id);
  res.status(200).json(evento);
});

const deletar = asyncHandler(async (req, res) => {
  await eventosService.deletar(req.params.id, req.usuario.id);
  res.status(204).send();
});

module.exports = { listar, listarPorComunidade, buscar, criar, atualizar, deletar };
