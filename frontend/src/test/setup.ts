import '@testing-library/jest-dom/vitest';

// jsdom não implementa matchMedia (usado por src/context/theme-provider.tsx
// pra detectar tema do SO) - sem isso todo teste que renderiza a árvore de
// providers quebra com "matchMedia is not a function".
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
