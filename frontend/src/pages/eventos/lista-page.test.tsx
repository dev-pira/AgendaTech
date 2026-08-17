import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import * as comunidadesService from '@/services/comunidades';
import * as eventosService from '@/services/eventos';
import { HttpError } from '@/services/http';
import type { Evento } from '@/types/api';

import { ListaEventosPage } from './lista-page';

// Ver #30 ([Test Coverage]) - eventos/lista-page.tsx estava em 0%. Cobre o
// achado do regressivo #92 (filtro de comunidade + paginação real).
const usuarioFake = { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' };
const comunidadeFake = {
  id: 'c1',
  nome: 'DEVPIRA',
  descricao: 'x',
  cidade: 'Piracicaba',
  contato: 'a@b.com',
  logo_url: null,
  criado_em: '2026-01-01T00:00:00Z',
};
const eventoFake: Evento = {
  id: 'e1',
  titulo: 'Meetup React',
  descricao: 'x',
  data: '2026-09-10',
  hora_inicio: '19:00',
  hora_fim: null,
  local: 'Online',
  tipo: 'online',
  url_online: null,
  criado_em: '2026-01-01T00:00:00Z',
  atualizado_em: '2026-01-01T00:00:00Z',
  comunidade: comunidadeFake,
  organizador: { id: 'u1', nome: 'Fabio' },
};

function renderPage(usuario: typeof usuarioFake | null = null) {
  return render(
    <MemoryRouter initialEntries={['/eventos']}>
      <AuthContext.Provider
        value={{ usuario, carregando: false, login: vi.fn(), registrar: vi.fn(), logout: vi.fn() }}
      >
        <ListaEventosPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

function mockListagemVazia() {
  vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
    dados: [comunidadeFake],
    paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 1 },
  });
  vi.spyOn(eventosService, 'listarEventos').mockResolvedValue({
    dados: [],
    paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
  });
}

describe('ListaEventosPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('não mostra "Novo Evento" pra visitante anônimo', async () => {
    mockListagemVazia();
    renderPage(null);

    await waitFor(() => expect(eventosService.listarEventos).toHaveBeenCalled());
    expect(screen.queryByRole('link', { name: 'Novo Evento' })).not.toBeInTheDocument();
  });

  it('mostra "Novo Evento" pra usuário logado', async () => {
    mockListagemVazia();
    renderPage(usuarioFake);

    await waitFor(() => expect(eventosService.listarEventos).toHaveBeenCalled());
    expect(screen.getByRole('link', { name: 'Novo Evento' })).toBeInTheDocument();
  });

  it('lista os eventos retornados e mostra o nome da comunidade', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [comunidadeFake],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 1 },
    });
    vi.spyOn(eventosService, 'listarEventos').mockResolvedValue({
      dados: [eventoFake],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 1 },
    });

    renderPage();

    expect(await screen.findByText('Meetup React')).toBeInTheDocument();
    expect(screen.getByText('DEVPIRA')).toBeInTheDocument();
  });

  it('mostra mensagem de vazio quando não há eventos', async () => {
    mockListagemVazia();
    renderPage();

    expect(await screen.findByText('Nenhum evento encontrado.')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro da API quando a listagem falha', async () => {
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });
    vi.spyOn(eventosService, 'listarEventos').mockRejectedValue(
      new HttpError(500, 'Não foi possível carregar eventos.'),
    );

    renderPage();

    expect(await screen.findByText('Não foi possível carregar eventos.')).toBeInTheDocument();
  });

  it('filtrar por cidade reseta a página e refaz a busca com o filtro', async () => {
    const user = userEvent.setup();
    mockListagemVazia();
    renderPage();

    await waitFor(() => expect(eventosService.listarEventos).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText('Filtrar por cidade...'), 'Limeira');

    await waitFor(() =>
      expect(eventosService.listarEventos).toHaveBeenLastCalledWith(
        expect.objectContaining({ cidade: 'Limeira', pagina: 1 }),
      ),
    );
  });

  it('mostra paginação e navega pra próxima página', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
      dados: [],
      paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: 0 },
    });
    vi.spyOn(eventosService, 'listarEventos').mockResolvedValue({
      dados: [eventoFake],
      paginacao: { pagina: 1, total_paginas: 2, limite: 12, total: 20 },
    });

    renderPage();

    const botaoProxima = await screen.findByRole('button', { name: 'Próxima' });
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(botaoProxima).not.toBeDisabled();

    await user.click(botaoProxima);

    await waitFor(() =>
      expect(eventosService.listarEventos).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagina: 2 }),
      ),
    );
  });
});
