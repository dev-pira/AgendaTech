/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('senha123', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'organizador@devlimeira.dev' },
    update: {},
    create: {
      nome: 'Organizador DevLimeira',
      email: 'organizador@devlimeira.dev',
      senhaHash,
    },
  });

  const comunidade = await prisma.comunidade.upsert({
    where: { nome: 'DevLimeira' },
    update: {},
    create: {
      nome: 'DevLimeira',
      descricao: 'Comunidade de tecnologia de Limeira/SP.',
      cidade: 'Limeira',
      contato: 'contato@devlimeira.dev',
      criadoPor: usuario.id,
      membros: {
        create: {
          usuarioId: usuario.id,
          papel: 'organizador',
          adicionadoPor: usuario.id,
        },
      },
    },
  });

  console.log('Seed concluído:', { usuario: usuario.email, comunidade: comunidade.nome });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
