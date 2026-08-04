process.env.NODE_ENV = 'test';

const { criarComunidadeSchema } = require('../src/validators/comunidade.validator');
const { criarEventoSchema } = require('../src/validators/evento.validator');
const { registroSchema } = require('../src/validators/auth.validator');

function amanha() {
  const data = new Date();
  data.setDate(data.getDate() + 1);
  return data.toISOString().slice(0, 10);
}

describe('comunidade.validator', () => {
  it('aceita um payload válido', () => {
    const resultado = criarComunidadeSchema.safeParse({
      body: {
        nome: 'DevLimeira',
        descricao: 'Comunidade de tecnologia de Limeira/SP',
        cidade: 'Limeira',
        contato: 'contato@devlimeira.dev',
      },
    });
    expect(resultado.success).toBe(true);
  });

  it('rejeita nome curto (RN-COM-02)', () => {
    const resultado = criarComunidadeSchema.safeParse({
      body: { nome: 'ab', descricao: 'x'.repeat(20), cidade: 'Limeira', contato: 'a@a.com' },
    });
    expect(resultado.success).toBe(false);
  });

  it('rejeita contato que não é email nem URL (RN-COM-04)', () => {
    const resultado = criarComunidadeSchema.safeParse({
      body: {
        nome: 'DevLimeira',
        descricao: 'Comunidade de tecnologia de Limeira/SP',
        cidade: 'Limeira',
        contato: 'nao-e-nem-email-nem-url',
      },
    });
    expect(resultado.success).toBe(false);
  });
});

describe('evento.validator', () => {
  const base = {
    titulo: 'Meetup de Node.js',
    descricao: 'Encontro mensal sobre o ecossistema Node.js e boas práticas.',
    data: amanha(),
    hora_inicio: '19:00',
    local: 'Espaço DevLimeira',
    tipo: 'presencial',
    comunidade_id: '11111111-1111-1111-1111-111111111111',
  };

  it('aceita um evento presencial válido', () => {
    const resultado = criarEventoSchema.safeParse({ body: base });
    expect(resultado.success).toBe(true);
  });

  it('rejeita evento online sem url_online (RN-EVT-06)', () => {
    const resultado = criarEventoSchema.safeParse({
      body: { ...base, tipo: 'online', url_online: undefined },
    });
    expect(resultado.success).toBe(false);
  });

  it('rejeita hora_fim antes de hora_inicio (RN-EVT-05)', () => {
    const resultado = criarEventoSchema.safeParse({
      body: { ...base, hora_inicio: '20:00', hora_fim: '19:00' },
    });
    expect(resultado.success).toBe(false);
  });

  it('rejeita data no passado (RN-EVT-04)', () => {
    const resultado = criarEventoSchema.safeParse({ body: { ...base, data: '2020-01-01' } });
    expect(resultado.success).toBe(false);
  });
});

describe('auth.validator', () => {
  it('rejeita senha curta', () => {
    const resultado = registroSchema.safeParse({
      body: { nome: 'Fulano', email: 'fulano@exemplo.com', senha: '123' },
    });
    expect(resultado.success).toBe(false);
  });

  it('normaliza email para minúsculas', () => {
    const resultado = registroSchema.safeParse({
      body: { nome: 'Fulano', email: 'FULANO@EXEMPLO.COM', senha: 'senha123' },
    });
    expect(resultado.success).toBe(true);
    expect(resultado.data.body.email).toBe('fulano@exemplo.com');
  });
});
