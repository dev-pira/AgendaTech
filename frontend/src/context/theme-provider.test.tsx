import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTheme } from '@/hooks/use-theme';

import { ThemeProvider } from './theme-provider';

// Ver #30 ([Test Coverage]) - theme-provider.tsx estava em 0%.
function mockMatchMedia(prefereDark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches: prefereDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    disparar: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => vi.restoreAllMocks());

  it('usa tema "system" por padrão, resolvendo pro claro/escuro do SO', () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('restaura o tema salvo no localStorage', () => {
    mockMatchMedia(false);
    localStorage.setItem('agenda-tech-theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('setTheme() troca o tema, persiste e aplica a classe "dark" no <html>', () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.setTheme('dark'));

    expect(result.current.resolvedTheme).toBe('dark');
    expect(localStorage.getItem('agenda-tech-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => result.current.setTheme('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reage a mudança de preferência do SO quando tema é "system"', () => {
    const { disparar } = mockMatchMedia(false);

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.resolvedTheme).toBe('light');

    act(() => disparar(true));
    expect(result.current.resolvedTheme).toBe('dark');
  });
});
