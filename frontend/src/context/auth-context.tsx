import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

import * as authService from '@/services/auth';
import { getToken, setToken } from '@/services/http';
import type { AuthResponse } from '@/types/api';

type Usuario = AuthResponse['usuario'];

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setCarregando(false);
      return;
    }
    authService
      .eu()
      .then(({ usuario: usuarioAtual }) => setUsuario(usuarioAtual))
      .catch(() => setToken(null))
      .finally(() => setCarregando(false));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const resposta = await authService.login({ email, senha });
    setToken(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    const resposta = await authService.registrar({ nome, email, senha });
    setToken(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
