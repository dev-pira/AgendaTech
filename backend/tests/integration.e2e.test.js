process.env.NODE_ENV = 'test';
require('dotenv').config();

/**
 * Teste de integração ponta-a-ponta contra um banco Postgres real.
 *
 * Exige DATABASE_URL configurada (ex.: backend/.env apontando para um Neon/Supabase
 * de desenvolvimento) e o schema já migrado (`npm run prisma:migrate`). Sem
 * DATABASE_URL — como em um ambiente de CI que ainda não provisionou banco — a suíte
 * inteira é pulada automaticamente, então `npm test` continua seguro em qualquer lugar.
 *
 * Rodar isoladamente: `npm run test:e2e`
 */

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

if (!hasDatabase) {
  // eslint-disable-next-line no-console
  console.warn(
    '[integration.e2e] DATABASE_URL não definida — suíte de integração pulada. ' +
      'Configure backend/.env para rodá-la localmente.',
  );
}

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describeIfDb('Fluxo ponta-a-ponta (auth -> comunidade -> evento -> calendário)', () => {
  jest.setTimeout(30000);

  const runId = Date.now();
  const email = `smoke.${runId}@exemplo.com`;
  const nomeComunidade = `Comunidade Smoke ${runId}`;

  let token;
  let usuarioId;
  let comunidadeId;
  let eventoId;

  function amanha() {
    const data = new Date(Date.now() + 86400000);
    return data.toISOString().slice(0, 10);
  }

  afterAll(async () => {
    // Limpeza: evento e membros são apagados em cascata junto com a comunidade.
    if (comunidadeId) {
      await prisma.comunidade.delete({ where: { id: comunidadeId } }).catch(() => {});
    }
    if (usuarioId) {
      await prisma.usuario.delete({ where: { id: usuarioId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('registra um usuário e retorna um token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nome: 'Ana Smoke', email, senha: 'senha123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    token = res.body.token;
    usuarioId = res.body.usuario.id;
  });

  it('bloqueia criação de comunidade sem autenticação (401)', async () => {
    const res = await request(app)
      .post('/api/comunidades')
      .send({ nome: 'X', descricao: 'x'.repeat(20), cidade: 'x', contato: 'a@a.com' });

    expect(res.status).toBe(401);
  });

  it('cria uma comunidade autenticado e o criador vira organizador', async () => {
    const res = await request(app)
      .post('/api/comunidades')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: nomeComunidade,
        descricao: 'Comunidade criada pelo teste de integração automatizado',
        cidade: 'Limeira',
        contato: 'smoke@exemplo.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.criado_por).toBe(usuarioId);
    comunidadeId = res.body.id;
  });

  it('lista comunidades e inclui a recém-criada', async () => {
    const res = await request(app).get('/api/comunidades').query({ limite: 100 });

    expect(res.status).toBe(200);
    expect(res.body.dados.some((c) => c.id === comunidadeId)).toBe(true);
  });

  it('cria um evento online na comunidade', async () => {
    const res = await request(app)
      .post('/api/eventos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: `Meetup Smoke ${runId}`,
        descricao: 'Evento criado pelo teste de integração automatizado',
        data: amanha(),
        hora_inicio: '19:00',
        local: 'Online',
        tipo: 'online',
        url_online: 'https://meet.example.com/smoke',
        comunidade_id: comunidadeId,
      });

    expect(res.status).toBe(201);
    eventoId = res.body.id;
  });

  it('o evento aparece no calendário compartilhado', async () => {
    const data = amanha();
    const res = await request(app)
      .get('/api/calendario')
      .query({ data_inicio: data, data_fim: data });

    expect(res.status).toBe(200);
    expect(res.body.eventos.some((e) => e.id === eventoId)).toBe(true);
  });
});
