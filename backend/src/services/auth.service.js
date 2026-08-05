const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const SALT_ROUNDS = 10;

function sanitizar(usuario) {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, criado_em: usuario.criadoEm };
}

function gerarToken(usuario) {
  return jwt.sign({ sub: usuario.id }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function registrar({ nome, email, senha }) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new ApiError(409, 'Já existe um usuário cadastrado com esse email');
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await prisma.usuario.create({ data: { nome, email, senhaHash } });

  return { usuario: sanitizar(usuario), token: gerarToken(usuario) };
}

async function login({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new ApiError(401, 'Credenciais inválidas');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    throw new ApiError(401, 'Credenciais inválidas');
  }

  return { usuario: sanitizar(usuario), token: gerarToken(usuario) };
}

module.exports = { registrar, login, sanitizar };
