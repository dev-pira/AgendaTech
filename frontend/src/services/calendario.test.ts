import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buscarCalendario } from './calendario';

// Ver #30 ([Test Coverage]) - calendario.ts estava em 0% de cobertura.
beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe('buscarCalendario', () => {
  it('chama GET /calendario com o período e filtros na query, sem Authorization', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ eventos: [], total: 0, periodo: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await buscarCalendario({
      data_inicio: '2026-09-01',
      data_fim: '2026-09-30',
      comunidade_id: '1',
      cidade: 'Limeira',
      tipo: 'presencial',
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(
      '/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30&comunidade_id=1&cidade=Limeira&tipo=presencial',
    );
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });
});
