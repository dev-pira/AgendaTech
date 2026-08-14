import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';
import * as comunidadesService from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Comunidade, Evento } from '@/types/api';

import { DetalheComunidadePage } from './detalhe-page';

// Ver #30 ([Test Coverage]) - comunidades/detalhe-page.tsx estava em 0%.
// Cobre a regra real de permissão (qualquer organizador, não só quem criou
// - achado do regressivo #92 comparando com a tela Blade).
const usuarioFake = { id: 'u1', nome: 'Fabio', email: 'fabio@example.com' };

function comunidadeFake(membros?: Comunidade['membros']): Comunidade {
  return {
    id: 'c1',
    nome: 'DEVPIRA',
    descricao: 'Comunidade de devs',
    cidade: 'Piracicaba',
    contato: 'contato@devpira.com',
    logo_url: null,
    total_membros: membros?.length,
    criado_em: '2026-01-01T00:00:00Z',
    membros,
  };
}

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
  comunidade: { id: 'c1', nome: 'DEVPIRA', cidade: 'Piracicaba' },
  organizador: { id: 'u1', nome: 'Fabio' },
};

function mockListaEventos(dados: Evento[] = []) {
  vi.spyOn(comunidadesService, 'listarEventosDaComunidade').mockResolvedValue({
    dados,
    paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: dados.length },
  });
}

function renderPage(usuario: typeof usuarioFake | null = null) {
  return render(
    <MemoryRouter initialEntries={['/comunidades/c1']}>
      <AuthContext.Provider
        value={{ usuario, carregando: false, login: vi.fn(), registrar: vi.fn(), logout: vi.fn() }}
      >
        <Routes>
          <Route path="/comunidades/:id" element={<DetalheComunidadePage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('DetalheComunidadePage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('mostra os dados da comunidade e os próximos eventos', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(comunidadeFake());
    mockListaEventos([eventoFake]);

    renderPage();

    expect(await screen.findByText('DEVPIRA')).toBeInTheDocument();
    expect(screen.getByText('Meetup React')).toBeInTheDocument();
  });

  it('mostra mensagem de vazio quando não há eventos futuros', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(comunidadeFake());
    mockListaEventos([]);

    renderPage();

    expect(await screen.findByText('Nenhum evento cadastrado.')).toBeInTheDocument();
  });

  it('mostra mensagem de erro quando a comunidade não é encontrada', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockRejectedValue(
      new HttpError(404, 'Comunidade não encontrada.'),
    );
    mockListaEventos([]);

    renderPage();

    expect(await screen.findByText('Comunidade não encontrada.')).toBeInTheDocument();
  });

  it('não mostra Editar/Excluir pra quem não é organizador', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeFake([{ usuario_id: 'u1', nome: 'Fabio', papel: 'membro' }]),
    );
    mockListaEventos([]);

    renderPage(usuarioFake);

    await screen.findByText('DEVPIRA');
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('mostra Editar/Excluir pra qualquer organizador (não só quem criou)', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeFake([{ usuario_id: 'u1', nome: 'Fabio', papel: 'organizador' }]),
    );
    mockListaEventos([]);

    renderPage(usuarioFake);

    expect(await screen.findByRole('link', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('mostra o total de membros com link "ver membros"', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeFake([{ usuario_id: 'u1', nome: 'Fabio', papel: 'organizador' }]),
    );
    mockListaEventos([]);

    renderPage(usuarioFake);

    expect(await screen.findByText('1 membro(s) —', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ver membros' })).toHaveAttribute(
      'href',
      '/comunidades/c1/membros',
    );
  });

  it('exclui a comunidade quando confirmado e volta pra listagem', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeFake([{ usuario_id: 'u1', nome: 'Fabio', papel: 'organizador' }]),
    );
    mockListaEventos([]);
    vi.spyOn(comunidadesService, 'excluirComunidade').mockResolvedValue(undefined);

    renderPage(usuarioFake);

    await user.click(await screen.findByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(comunidadesService.excluirComunidade).toHaveBeenCalledWith('c1'));
  });

  it('mostra erro quando a exclusão falha (ex: comunidade com evento futuro)', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(
      comunidadeFake([{ usuario_id: 'u1', nome: 'Fabio', papel: 'organizador' }]),
    );
    mockListaEventos([]);
    vi.spyOn(comunidadesService, 'excluirComunidade').mockRejectedValue(
      new HttpError(400, 'Não é possível excluir comunidade com evento futuro.'),
    );

    renderPage(usuarioFake);

    await user.click(await screen.findByRole('button', { name: 'Excluir' }));

    expect(
      await screen.findByText('Não é possível excluir comunidade com evento futuro.'),
    ).toBeInTheDocument();
  });
});
