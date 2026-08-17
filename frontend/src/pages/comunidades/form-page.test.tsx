import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as comunidadesService from '@/services/comunidades';
import { HttpError } from '@/services/http';
import type { Comunidade } from '@/types/api';

import { FormComunidadePage } from './form-page';

// Ver #30 ([Test Coverage]) - comunidades/form-page.tsx estava em 0%.
const comunidadeExistente: Comunidade = {
  id: 'c1',
  nome: 'DEVPIRA',
  descricao: 'Comunidade de devs de Piracicaba',
  cidade: 'Piracicaba',
  contato: 'contato@devpira.com',
  logo_url: null,
  criado_em: '2026-01-01T00:00:00Z',
};

function renderCriar() {
  return render(
    <MemoryRouter initialEntries={['/comunidades/nova']}>
      <Routes>
        <Route path="/comunidades/nova" element={<FormComunidadePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditar() {
  return render(
    <MemoryRouter initialEntries={['/comunidades/c1/editar']}>
      <Routes>
        <Route path="/comunidades/:id/editar" element={<FormComunidadePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function preencherFormulario(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome'), 'DevCity');
  await user.type(screen.getByLabelText('Descrição'), 'Comunidade local de desenvolvedores');
  await user.type(screen.getByLabelText('Cidade'), 'São Paulo');
  await user.type(screen.getByLabelText('Contato (e-mail ou URL)'), 'dev@city.com');
}

describe('FormComunidadePage (criar)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renderiza o formulário vazio com título "Nova comunidade"', () => {
    renderCriar();

    expect(screen.getByText('Nova comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  it('chama criarComunidade() com os dados preenchidos e navega pra tela da comunidade', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'criarComunidade').mockResolvedValue(comunidadeExistente);

    renderCriar();
    await preencherFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(comunidadesService.criarComunidade).toHaveBeenCalledWith({
        nome: 'DevCity',
        descricao: 'Comunidade local de desenvolvedores',
        cidade: 'São Paulo',
        contato: 'dev@city.com',
        logo_url: undefined,
      }),
    );
  });

  it('mostra a mensagem de erro da API quando falha ao salvar (ex: nome duplicado)', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'criarComunidade').mockRejectedValue(
      new HttpError(409, 'Já existe uma comunidade com esse nome.'),
    );

    renderCriar();
    await preencherFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Já existe uma comunidade com esse nome.')).toBeInTheDocument();
  });
});

describe('FormComunidadePage (editar)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('carrega os dados existentes e mostra o título "Editar comunidade"', async () => {
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(comunidadeExistente);

    renderEditar();

    expect(await screen.findByText('Editar comunidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('DEVPIRA');
    expect(screen.getByLabelText('Cidade')).toHaveValue('Piracicaba');
  });

  it('chama atualizarComunidade() com o id certo ao salvar', async () => {
    const user = userEvent.setup();
    vi.spyOn(comunidadesService, 'buscarComunidade').mockResolvedValue(comunidadeExistente);
    vi.spyOn(comunidadesService, 'atualizarComunidade').mockResolvedValue(comunidadeExistente);

    renderEditar();
    await screen.findByText('Editar comunidade');

    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'DEVPIRA - Piracicaba');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(comunidadesService.atualizarComunidade).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ nome: 'DEVPIRA - Piracicaba' }),
      ),
    );
  });
});
