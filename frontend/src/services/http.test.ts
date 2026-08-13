import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError, getToken, getUsuario, request, setToken, setUsuario } from './http';

describe('getToken / setToken', () => {
  beforeEach(() => localStorage.clear());

  it('não retorna nada quando não há token salvo', () => {
    expect(getToken()).toBeNull();
  });

  it('persiste e recupera o token', () => {
    setToken('token-de-teste');
    expect(getToken()).toBe('token-de-teste');
  });

  it('remove o token do storage quando setToken(null)', () => {
    setToken('token-de-teste');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe('getUsuario / setUsuario', () => {
  beforeEach(() => localStorage.clear());

  it('não retorna nada quando não há usuário salvo', () => {
    expect(getUsuario()).toBeNull();
  });

  it('persiste e recupera o usuário como objeto (round-trip via JSON)', () => {
    // id é uuid (string), não numérico - users.id é uuid() na migration.
    const usuario = { id: '9d1c1e2a-1111-4b1a-9c1a-000000000001', nome: 'Fabio Baldin', email: 'fabio@example.com' };
    setUsuario(usuario);
    expect(getUsuario()).toEqual(usuario);
  });

  it('remove o usuário do storage quando setUsuario(null)', () => {
    setUsuario({ id: '9d1c1e2a-1111-4b1a-9c1a-000000000001', nome: 'Fabio Baldin', email: 'fabio@example.com' });
    setUsuario(null);
    expect(getUsuario()).toBeNull();
  });

  it('não quebra e devolve null se o JSON salvo estiver corrompido', () => {
    localStorage.setItem('agendatech:usuario', '{isso não é json válido');
    expect(getUsuario()).toBeNull();
  });
});

describe('request', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia Authorization Bearer quando há token salvo e auth !== false', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await request('/comunidades');

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer abc123');
  });

  it('não envia Authorization quando auth: false', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await request('/auth/token', { auth: false });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('devolve undefined em respostas 204 sem tentar parsear corpo', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    const resultado = await request('/comunidades/1');

    expect(resultado).toBeUndefined();
  });

  it('lança HttpError lendo error.message/error.details do envelope real da API', async () => {
    // Formato real do ApiErrorResponder do Laravel: {error:{code,message,details}}
    // - esse contrato incorreto (antes lia erro.mensagem) foi a causa raiz
    // do bug de login corrigido nesta sessão (issue relacionada #93/PR #94).
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 'VALIDATION_ERROR', message: 'Credenciais inválidas.', details: { campo: 'senha' } },
        }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      ),
    );

    await expect(request('/auth/token', { auth: false })).rejects.toMatchObject({
      name: 'HttpError',
      status: 401,
      message: 'Credenciais inválidas.',
      details: { campo: 'senha' },
    });
  });

  it('usa uma mensagem de fallback quando a resposta de erro não é JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('erro interno', {
        status: 500,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    await expect(request('/comunidades')).rejects.toThrow('Erro 500 ao chamar /comunidades');
  });

  it('monta a query string ignorando valores undefined/null/vazios', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await request('/comunidades', { query: { cidade: 'Limeira', pagina: 2, busca: '', tag: undefined } });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades?cidade=Limeira&pagina=2');
  });
});

describe('HttpError', () => {
  it('carrega status, message e details opcionais', () => {
    const erro = new HttpError(404, 'Não encontrado', { id: 42 });
    expect(erro.status).toBe(404);
    expect(erro.message).toBe('Não encontrado');
    expect(erro.details).toEqual({ id: 42 });
    expect(erro.name).toBe('HttpError');
  });
});
