import { getToken, HttpError } from '@/services/http';
import type { AuthResponse } from '@/types/api';

import { uuid, usuarios } from './db';
import { delay } from './utils';

function sanitizar(usuario: (typeof usuarios)[number]): AuthResponse['usuario'] {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, criado_em: usuario.criado_em };
}

export async function registrar(dados: {
  nome: string;
  email: string;
  senha: string;
}): Promise<AuthResponse> {
  await delay();
  if (usuarios.some((u) => u.email.toLowerCase() === dados.email.toLowerCase())) {
    throw new HttpError(409, 'Já existe um usuário cadastrado com esse email [mock]');
  }
  const usuario = {
    id: uuid(),
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
    criado_em: new Date().toISOString(),
  };
  usuarios.push(usuario);
  return { usuario: sanitizar(usuario), token: usuario.id };
}

export async function login(dados: { email: string; senha: string }): Promise<AuthResponse> {
  await delay();
  const usuario = usuarios.find((u) => u.email.toLowerCase() === dados.email.toLowerCase());
  if (!usuario || usuario.senha !== dados.senha) {
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
