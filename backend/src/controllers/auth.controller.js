const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const registrar = asyncHandler(async (req, res) => {
  const resultado = await authService.registrar(req.body);
  res.status(201).json(resultado);
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  res.status(200).json(resultado);
});

const eu = asyncHandler(async (req, res) => {
  res.status(200).json({ usuario: req.usuario });
});

module.exports = { registrar, login, eu };
