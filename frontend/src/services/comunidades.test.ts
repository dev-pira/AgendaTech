import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  adicionarMembro,
  atualizarComunidade,
  atualizarPapelMembro,
  buscarComunidade,
  criarComunidade,
  excluirComunidade,
  listarComunidades,
  listarEventosDaComunidade,
  listarMembros,
  removerMembro,
} from './comunidades';
import { setToken } from './http';

// Ver issue "[Test Coverage] 3.2 Pipeline de STG (Testes)" (#30) - comunidades.ts
// estava em 0% de cobertura. São wrappers finos sobre request() (ver
// services/http.test.ts), então o que importa testar aqui é a URL/método/
// query montada certa pra cada endpoint, não a lógica de HTTP em si.
function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  localStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

describe('listarComunidades', () => {
  it('chama GET /comunidades sem Authorization (rota pública)', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ dados: [], paginacao: {} }));

    await listarComunidades({ busca: 'dev', cidade: 'Limeira', pagina: 2 });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades?busca=dev&cidade=Limeira&pagina=2');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });
});

describe('buscarComunidade', () => {
  it('chama GET /comunidades/:id sem Authorization', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: '1' }));

    await buscarComunidade('1');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1');
    expect(init?.method ?? 'GET').toBe('GET');
  });
});

describe('criarComunidade', () => {
  it('chama POST /comunidades com Authorization (rota autenticada)', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: '1' }, 201));

    await criarComunidade({ nome: 'DevCity', descricao: 'x', cidade: 'SP', contato: 'a@b.com' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades');
    expect(init?.method).toBe('POST');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer abc123');
  });
});

describe('atualizarComunidade', () => {
  it('chama PUT /comunidades/:id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: '1' }));

    await atualizarComunidade('1', { nome: 'Novo nome' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1');
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(init?.body as string)).toEqual({ nome: 'Novo nome' });
  });
});

describe('excluirComunidade', () => {
  it('chama DELETE /comunidades/:id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await excluirComunidade('1');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1');
    expect(init?.method).toBe('DELETE');
  });
});

describe('listarEventosDaComunidade', () => {
  it('chama GET /comunidades/:id/eventos sem Authorization', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ dados: [], paginacao: {} }));

    await listarEventosDaComunidade('1', { pagina: 1 });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1/eventos?pagina=1');
  });
});

describe('listarMembros', () => {
  it('chama GET /comunidades/:id/membros (rota autenticada)', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ dados: [], paginacao: {} }));

    await listarMembros('1', { papel: 'organizador' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1/membros?papel=organizador');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer abc123');
  });
});

describe('adicionarMembro', () => {
  it('chama POST /comunidades/:id/membros', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ usuario_id: '2' }, 201));

    await adicionarMembro('1', { email: 'novo@membro.com', papel: 'membro' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1/membros');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ email: 'novo@membro.com', papel: 'membro' });
  });
});

describe('atualizarPapelMembro', () => {
  it('chama PATCH /comunidades/:id/membros/:usuarioId/papel', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ usuario_id: '2' }));

    await atualizarPapelMembro('1', '2', 'organizador');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1/membros/2/papel');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(init?.body as string)).toEqual({ papel: 'organizador' });
  });
});

describe('removerMembro', () => {
  it('chama DELETE /comunidades/:id/membros/:usuarioId', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await removerMembro('1', '2');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/comunidades/1/membros/2');
    expect(init?.method).toBe('DELETE');
  });
});
