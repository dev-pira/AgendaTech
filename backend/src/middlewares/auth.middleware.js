const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const { jwtSecret } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

/** Exige um Bearer token válido e popula req.usuario. */
const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Token de autenticação ausente');
  }

  const token = header.slice('Bearer '.length).trim();
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new ApiError(401, 'Token inválido ou expirado');
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: payload.sub } });
  if (!usuario) {
    throw new ApiError(401, 'Usuário do token não existe mais');
  }

  req.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
  next();
});

module.exports = { requireAuth };
