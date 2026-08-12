import { createContext, useCallback, useState, type ReactNode } from 'react';

import * as authService from '@/services/auth';
import { getToken, getUsuario, setToken, setUsuario as persistUsuario } from '@/services/http';
import type { AuthResponse } from '@/types/api';

type Usuario = AuthResponse['usuario'];

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // O backend nao tem endpoint tipo GET /auth/eu (ver issue #93), entao a
  // sessao e restaurada a partir do que foi persistido no login em vez de
  // uma consulta - se o token expirar, as chamadas normais da API vao
  // falhar com 401 e o app trata isso na hora (nao precisa validar aqui).
  const [usuario, setUsuario] = useState<Usuario | null>(() => (getToken() ? getUsuario() : null));
  const [carregando] = useState(false);

  const login = useCallback(async (usuario: string, senha: string) => {
    const resposta = await authService.login({ username: usuario, password: senha });
    setToken(resposta.token);
    persistUsuario(resposta.usuario);
    setUsuario(resposta.usuario);
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    const resposta = await authService.registrar({ nome, email, senha });
    setToken(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    persistUsuario(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
