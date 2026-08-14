import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  atualizarEvento,
  buscarEvento,
  criarEvento,
  excluirEvento,
  listarEventos,
} from './eventos';
import { setToken } from './http';

// Ver #30 ([Test Coverage]) - eventos.ts estava em 0% de cobertura.
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

describe('listarEventos', () => {
  it('chama GET /eventos com os filtros na query, sem Authorization', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ dados: [], paginacao: {} }));

    await listarEventos({ comunidade_id: '1', tipo: 'online', pagina: 2 });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/eventos?comunidade_id=1&tipo=online&pagina=2');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('chama GET /eventos sem query quando não há filtros', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ dados: [], paginacao: {} }));

    await listarEventos();

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/eventos');
  });
});

describe('buscarEvento', () => {
  it('chama GET /eventos/:id sem Authorization', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: '1' }));

    await buscarEvento('1');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/eventos/1');
    expect(init?.method ?? 'GET').toBe('GET');
  });
});

describe('criarEvento', () => {
  it('chama POST /eventos com Authorization', async () => {
    setToken('abc123');
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: '1' }, 201));

    await criarEvento({
      titulo: 'Meetup',
      descricao: 'x',
      data: '2026-09-01',
      hora_inicio: '19:00',
      local: 'Online',
      tipo: 'online',
      comunidade_id: '1',
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/eventos');
    expect(init?.method).toBe('POST');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer abc123');
  });
});

describe('atualizarEvento', () => {
  it('chama PUT /eventos/:id com o body enviado', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: '1' }));

    await atualizarEvento('1', { titulo: 'Novo título' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/eventos/1');
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(init?.body as string)).toEqual({ titulo: 'Novo título' });
  });
});

describe('excluirEvento', () => {
  it('chama DELETE /eventos/:id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await excluirEvento('1');

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/eventos/1');
    expect(init?.method).toBe('DELETE');
  });
});
