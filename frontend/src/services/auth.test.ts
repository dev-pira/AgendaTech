import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eu, login, registrar } from './auth';

// MOCK_ENABLED é lido de import.meta.env.VITE_USE_MOCK, que não é 'true' no
// ambiente de teste - então essas funções passam direto pro request() real
// (ver services/http.ts), só com fetch mockado. Ver issue #30 (cobertura de
// código no CI) - auth.ts estava em 0% antes desses testes.
describe('registrar', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('chama POST /cadastro sem enviar Authorization', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ token: 'abc', usuario: { id: '1', nome: 'Fabio' } }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await registrar({
      username: 'fabio',
      first_name: 'Fabio',
      last_name: 'Baldin',
      email: 'fabio@example.com',
      password: 'segredo123',
      password_confirmation: 'segredo123',
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/cadastro');
    expect(init?.method).toBe('POST');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });
});

describe('login', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('chama POST /auth/token com username e password', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ token: 'abc', usuario: { id: '1', nome: 'Fabio' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await login({ username: 'fabio', password: 'segredo123' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/auth/token');
    expect(JSON.parse(init?.body as string)).toEqual({ username: 'fabio', password: 'segredo123' });
  });
});

describe('eu', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('chama GET /auth/eu', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ usuario: { id: '1', nome: 'Fabio' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await eu();

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/auth/eu');
    expect(init?.method).toBe('GET');
  });
});
