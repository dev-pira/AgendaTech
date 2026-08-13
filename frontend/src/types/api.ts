/**
 * Tipos espelhando o contrato real do backend (backend/src) — não o
 * docs/escopo-funcional.md, que diverge em alguns pontos (ex.: resposta do
 * /api/calendario usa `eventos`/`total`, não `dados`/`total_eventos`; a
 * listagem de membros aninha nome/email em `usuario`, não no nível raiz).
 */

export type PapelMembro = 'organizador' | 'membro';
export type TipoEvento = 'presencial' | 'online' | 'hibrido';

export interface Paginacao {
  pagina: number;
  limite: number;
  total: number;
  total_paginas: number;
}

export interface ListaResponse<T> {
  dados: T[];
  paginacao: Paginacao;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
}

// Retorno de UsuarioResumoResource::toArray no backend - so id/nome (sem
// email, ao contrario de UsuarioResumo). Usado em Comunidade.criado_por.
export interface CriadorResumo {
  id: string;
  nome: string;
}

export interface Comunidade {
  id: string;
  nome: string;
  descricao: string;
  cidade: string;
  contato: string;
  logo_url: string | null;
  criado_em: string;
  // atualizado_em e criado_por so vem em ComunidadeDetailResource (GET
  // /comunidades/{id}) - ComunidadeResource (listagem) nao inclui nenhum
  // dos dois. Opcionais aqui pra refletir isso - ver issue #99.
  atualizado_em?: string;
  criado_por?: CriadorResumo;
  total_membros?: number;
}

export interface ComunidadeInput {
  nome: string;
  descricao: string;
  cidade: string;
  contato: string;
  logo_url?: string;
}

export interface ComunidadeEvento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora_inicio: string;
  hora_fim: string | null;
  local: string;
  tipo: TipoEvento;
  url_online: string | null;
  comunidade_id: string;
  organizador_id: string;
  criado_em: string;
  atualizado_em: string;
  comunidade?: {
    id: string;
    nome: string;
    cidade: string;
  };
}

export type Evento = ComunidadeEvento;

export interface EventoInput {
  titulo: string;
  descricao: string;
  data: string;
  hora_inicio: string;
  hora_fim?: string;
  local: string;
  tipo: TipoEvento;
  url_online?: string;
  comunidade_id: string;
}

export interface Membro {
  comunidade_id: string;
  usuario_id: string;
  papel: PapelMembro;
  adicionado_em: string;
  adicionado_por: string;
  usuario?: UsuarioResumo;
}

export interface CalendarioResponse {
  eventos: Evento[];
  total: number;
  periodo: {
    data_inicio?: string;
    data_fim?: string;
  };
}

export interface AuthResponse {
  // Corrigido pra bater com o retorno real de
  // App\Http\Controllers\Api\AuthController::obterToken (ver issue #93) -
  // o backend Laravel nao tem criado_em nessa resposta. POST /cadastro
  // (issue #73) devolve o mesmo formato (loga o usuario automaticamente).
  usuario: UsuarioResumo;
  token: string;
}

// Bate com CadastroRequest (backend) - ver issue #73. password_confirmation
// e exigido pela regra 'confirmed' do Laravel (compara com password).
export interface CadastroInput {
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  password: string;
  password_confirmation: string;
}

export interface ApiErrorBody {
  // Nomes em ingles - bate com App\Support\ApiErrorResponder no Laravel,
  // nao com o "erro/mensagem" em portugues do contrato antigo (Node). Ver
  // issue #93.
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
