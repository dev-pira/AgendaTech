import type { ApiErrorBody, AuthResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'agendatech:token';
const USUARIO_KEY = 'agendatech:usuario';

/**
 * Liga a camada de mock (src/mocks/) no lugar das chamadas HTTP reais — permite
 * ver a aplicação inteira funcionando sem nenhum backend disponível. Ver
 * frontend/README.md#modo-mock.
 */
export const MOCK_ENABLED = import.meta.env.VITE_USE_MOCK === 'true';

if (!MOCK_ENABLED && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[agendatech] VITE_USE_MOCK=false mas VITE_API_URL não está definida — chamadas de API vão ' +
      "cair em '/api' relativo ao domínio atual, o que provavelmente não existe. Ver " +
      'docs/development/backend-integration.md.',
  );
}

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// O backend nao tem (ainda) um endpoint tipo GET /auth/eu pra consultar
// quem esta logado a partir so do token - o JWT so carrega o id do
// usuario (ver JwtService::encode). Por isso persistimos os dados basicos
// do usuario devolvidos no login, pra sobreviver a um F5 sem precisar
// dessa consulta. Ver issue #93.
export function getUsuario(): AuthResponse['usuario'] | null {
  const bruto = localStorage.getItem(USUARIO_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as AuthResponse['usuario'];
  } catch {
    return null;
  }
}

export function setUsuario(usuario: AuthResponse['usuario'] | null) {
  if (usuario) localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  else localStorage.removeItem(USUARIO_KEY);
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: QueryParams;
  auth?: boolean;
};

function buildQuery(query?: QueryParams) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const errorBody = payload as ApiErrorBody | undefined;
    throw new HttpError(
      response.status,
      errorBody?.error?.message ?? `Erro ${response.status} ao chamar ${path}`,
      errorBody?.error?.details,
    );
  }

  return payload as T;
}
