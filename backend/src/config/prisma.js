const { PrismaClient } = require('@prisma/client');

// Instância única do Prisma Client compartilhada por toda a aplicação
// (evita esgotar o pool de conexões do Postgres em dev com --watch).
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
