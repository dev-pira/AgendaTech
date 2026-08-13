import { getToken, HttpError } from '@/services/http';
import type { AuthResponse, CadastroInput } from '@/types/api';

import { uuid, usuarios } from './db';
import { delay } from './utils';

function sanitizar(usuario: (typeof usuarios)[number]): AuthResponse['usuario'] {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

export async function registrar(dados: CadastroInput): Promise<AuthResponse> {
  await delay();
  if (dados.password !== dados.password_confirmation) {
    throw new HttpError(422, 'As senhas não coincidem [mock]');
  }
  if (usuarios.some((u) => u.email.toLowerCase() === dados.email.toLowerCase())) {
    throw new HttpError(409, 'Já existe um usuário cadastrado com esse email [mock]');
  }
  const usuario = {
    id: uuid(),
    nome: `${dados.first_name} ${dados.last_name ?? ''}`.trim(),
    email: dados.email,
    senha: dados.password,
    criado_em: new Date().toISOString(),
  };
  usuarios.push(usuario);
  return { usuario: sanitizar(usuario), token: usuario.id };
}

export async function login(dados: { username: string; password: string }): Promise<AuthResponse> {
  await delay();
  // Os dados de mock (mocks/db.ts) só têm email, sem username separado -
  // no modo mock, digite o email de um dos usuários seed no campo
  // "Usuário" (ver mocks/db.ts pros valores disponíveis).
  const usuario = usuarios.find((u) => u.email.toLowerCase() === dados.username.toLowerCase());
  if (!usuario || usuario.senha !== dados.password) {
    throw new HttpError(401, 'Credenciais inválidas [mock]');
  }
  return { usuario: sanitizar(usuario), token: usuario.id };
}

export async function eu(): Promise<{ usuario: AuthResponse['usuario'] }> {
  await delay(80);
  const usuario = usuarios.find((u) => u.id === getToken());
  if (!usuario) {
    throw new HttpError(401, 'Token inválido ou expirado [mock]');
  }
  return { usuario: sanitizar(usuario) };
}

/** Usado pelos outros módulos de mock pra saber "quem está logado" e aplicar as mesmas
 * regras de permissão do backend real (RN-COM-07, RN-EVT-09, RN-ORG-01, etc). */
export function usuarioAtual() {
  const usuario = usuarios.find((u) => u.id === getToken());
  return usuario ? sanitizar(usuario) : null;
}

export function exigirAutenticacao() {
  const usuario = usuarioAtual();
  if (!usuario) throw new HttpError(401, 'Token de autenticação ausente [mock]');
  return usuario;
}
