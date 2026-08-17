import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as calendarioService from '@/services/calendario';
import * as comunidadesService from '@/services/comunidades';
import { HttpError } from '@/services/http';

import { CalendarioPage } from './calendario-page';

// Ver #30 ([Test Coverage]) - calendario-page.tsx estava em 0%. FullCalendar
// dispara datesSet() assim que monta (mesmo em jsdom), então os testes
// abaixo cobrem: carregamento inicial de comunidades pro filtro, filtro
// disparando nova busca e tratamento de erro - não o widget do calendário
// em si (é biblioteca de terceiro).
const comunidadeFake = {
  id: '1',
  nome: 'DEVPIRA',
  descricao: 'x',
  cidade: 'Piracicaba',
  contato: 'a@b.com',
  logo_url: null,
  criado_em: '2026-01-01T00:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/calendario']}>
      <CalendarioPage />
    </MemoryRouter>,
  );
}

describe('CalendarioPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('carrega a lista de comunidades pro filtro ao montar', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [comunidadeFake],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 1 },
    });
    vi.spyOn(calendarioService, 'buscarCalendario').mockResolvedValue({
      eventos: [],
      total: 0,
      periodo: { data_inicio: '2026-09-01', data_fim: '2026-09-30' },
    });

    renderPage();

    await waitFor(() =>
      expect(comunidadesService.listarComunidades).toHaveBeenCalledWith({ limite: 100 }),
    );
  });

  it('busca eventos do período assim que o calendário monta (via datesSet)', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });
    vi.spyOn(calendarioService, 'buscarCalendario').mockResolvedValue({
      eventos: [],
      total: 0,
      periodo: { data_inicio: '2026-09-01', data_fim: '2026-09-30' },
    });

    renderPage();

    await waitFor(() => expect(calendarioService.buscarCalendario).toHaveBeenCalled());
  });

  it('mostra a mensagem de erro da API quando o calendário falha ao carregar', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });
    vi.spyOn(calendarioService, 'buscarCalendario').mockRejectedValue(
      new HttpError(500, 'Não foi possível carregar o calendário.'),
    );

    renderPage();

    expect(await screen.findByText('Não foi possível carregar o calendário.')).toBeInTheDocument();
  });

  it('filtrar por cidade atualiza o campo e dispara nova busca', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });
    vi.spyOn(calendarioService, 'buscarCalendario').mockResolvedValue({
      eventos: [],
      total: 0,
      periodo: { data_inicio: '2026-09-01', data_fim: '2026-09-30' },
    });

    renderPage();
    await waitFor(() => expect(calendarioService.buscarCalendario).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText('Filtrar por cidade...'), 'Limeira');

    await waitFor(() =>
      expect(calendarioService.buscarCalendario).toHaveBeenLastCalledWith(
        expect.objectContaining({ cidade: 'Limeira' }),
      ),
    );
  });
});
