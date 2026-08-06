import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const CHAVE_STORAGE = 'agenda-tech-theme';
const MEDIA_QUERY_DARK = '(prefers-color-scheme: dark)';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function lerTemaSalvo(): Theme {
  const salvo = localStorage.getItem(CHAVE_STORAGE);
  if (salvo === 'light' || salvo === 'dark' || salvo === 'system') return salvo;
  return 'system';
}

function resolverTema(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return window.matchMedia(MEDIA_QUERY_DARK).matches ? 'dark' : 'light';
  }
  return theme;
}

function aplicarTema(resolvedTheme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(lerTemaSalvo);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolverTema(theme));

  useEffect(() => {
    const resolvido = resolverTema(theme);
    setResolvedTheme(resolvido);
    aplicarTema(resolvido);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia(MEDIA_QUERY_DARK);
    const aoMudarPreferenciaSistema = () => {
      const novoResolvido = resolverTema('system');
      setResolvedTheme(novoResolvido);
      aplicarTema(novoResolvido);
    };

    mediaQuery.addEventListener('change', aoMudarPreferenciaSistema);
    return () => mediaQuery.removeEventListener('change', aoMudarPreferenciaSistema);
  }, [theme]);

  const setTheme = useCallback((novoTema: Theme) => {
    localStorage.setItem(CHAVE_STORAGE, novoTema);
    setThemeState(novoTema);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
