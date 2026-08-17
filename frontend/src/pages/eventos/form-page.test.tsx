import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as comunidadesService from '@/services/comunidades';
import * as eventosService from '@/services/eventos';
import { HttpError } from '@/services/http';
import type { Comunidade, Evento } from '@/types/api';

import { FormEventoPage } from './form-page';

// Ver #30 ([Test Coverage]) - eventos/form-page.tsx estava em 0%. Cobre a
// regressão corrigida no #92 (evento.comunidade.id, não o
// evento.comunidade_id inexistente na API real) e a #104 (comunidade
// mostrada como texto estático em edição, não Select desabilitado).
const comunidadeFake: Comunidade = {
  id: 'c1',
  nome: 'DEVPIRA',
  descricao: 'x',
  cidade: 'Piracicaba',
  contato: 'a@b.com',
  logo_url: null,
  criado_em: '2026-01-01T00:00:00Z',
};

const eventoExistente: Evento = {
  id: 'e1',
  titulo: 'Meetup React',
  descricao: 'Um encontro sobre React e afins',
  data: '2026-09-10',
  hora_inicio: '19:00',
  hora_fim: '21:00',
  local: 'Online',
  tipo: 'online',
  url_online: 'https://meet.example.com/x',
  criado_em: '2026-01-01T00:00:00Z',
  atualizado_em: '2026-01-01T00:00:00Z',
  comunidade: comunidadeFake,
  organizador: { id: 'u1', nome: 'Fabio' },
};

function mockListarComunidades(dados: Comunidade[] = [comunidadeFake]) {
  vi.spyOn(comunidadesService, 'listarComunidades').mockResolvedValue({
    dados,
    paginacao: { pagina: 1, total_paginas: 1, limite: 12, total: dados.length },
  });
}

function renderCriar() {
  return render(
    <MemoryRouter initialEntries={['/eventos/novo']}>
      <Routes>
        <Route path="/eventos/novo" element={<FormEventoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditar() {
  return render(
    <MemoryRouter initialEntries={['/eventos/e1/editar']}>
      <Routes>
        <Route path="/eventos/:id/editar" element={<FormEventoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('FormEventoPage (criar)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pré-seleciona a primeira comunidade da lista', async () => {
    mockListarComunidades();

    renderCriar();

    expect(await screen.findByText('Novo evento')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Comunidade' })).toHaveTextContent('DEVPIRA');
  });

  it('chama criarEvento() com os dados preenchidos (tipo presencial não exige url_online)', async () => {
    const user = userEvent.setup();
    mockListarComunidades();
    vi.spyOn(eventosService, 'criarEvento').mockResolvedValue(eventoExistente);

    renderCriar();
    await screen.findByText('Novo evento');

    await user.type(screen.getByLabelText('Título'), 'Meetup TypeScript');
    await user.type(screen.getByLabelText('Descrição'), 'Um encontro sobre TypeScript avançado');
    await user.type(screen.getByLabelText('Data'), '2026-10-01');
    await user.type(screen.getByLabelText('Início'), '19:00');
    await user.type(screen.getByLabelText('Local'), 'Auditório Central');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(eventosService.criarEvento).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Meetup TypeScript',
          comunidade_id: 'c1',
          tipo: 'presencial',
          url_online: undefined,
        }),
      ),
    );
  });

  it('mostra a mensagem de erro da API quando falha ao salvar', async () => {
    const user = userEvent.setup();
    mockListarComunidades();
    vi.spyOn(eventosService, 'criarEvento').mockRejectedValue(
      new HttpError(409, 'Já existe um evento com esse título nessa comunidade e data.'),
    );

    renderCriar();
    await screen.findByText('Novo evento');
    await user.type(screen.getByLabelText('Título'), 'Meetup TypeScript');
    await user.type(screen.getByLabelText('Descrição'), 'Um encontro sobre TypeScript avançado');
    await user.type(screen.getByLabelText('Data'), '2026-10-01');
    await user.type(screen.getByLabelText('Início'), '19:00');
    await user.type(screen.getByLabelText('Local'), 'Auditório Central');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Já existe um evento com esse título nessa comunidade e data.'),
    ).toBeInTheDocument();
  });
});

describe('FormEventoPage (editar)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('carrega os dados do evento e mostra a comunidade como texto (não Select)', async () => {
    mockListarComunidades();
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoExistente);

    renderEditar();

    expect(await screen.findByText('Editar evento')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Meetup React');
    // #104: em edição é <p id="comunidade">, não um <select> - texto
    // estático continua visível mesmo sem interação nenhuma.
    expect(screen.getByText('DEVPIRA')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Comunidade' })).not.toBeInTheDocument();
  });

  it('usa evento.comunidade.id (não comunidade_id) pra pré-carregar o form', async () => {
    // #92: evento.comunidade_id não existe na API real - só
    // evento.comunidade.id. Comprova que o form não fica com "—".
    mockListarComunidades();
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoExistente);

    renderEditar();

    await screen.findByText('Editar evento');
    expect(screen.queryByText('—')).not.toBeInTheDocument();
    expect(screen.getByText('DEVPIRA')).toBeInTheDocument();
  });

  it('chama atualizarEvento() com o id certo ao salvar', async () => {
    const user = userEvent.setup();
    mockListarComunidades();
    vi.spyOn(eventosService, 'buscarEvento').mockResolvedValue(eventoExistente);
    vi.spyOn(eventosService, 'atualizarEvento').mockResolvedValue(eventoExistente);

    renderEditar();
    await screen.findByText('Editar evento');

    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'Meetup React - Edição especial');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(eventosService.atualizarEvento).toHaveBeenCalledWith(
        'e1',
        expect.objectContaining({ titulo: 'Meetup React - Edição especial' }),
      ),
    );
  });
});
