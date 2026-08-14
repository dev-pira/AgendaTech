import { describe, expect, it } from 'vitest';

import { corPorComunidade } from './colors';

// Ver #30 ([Test Coverage]) - colors.ts estava em 0%.
describe('corPorComunidade', () => {
  it('devolve sempre a mesma cor pro mesmo id (estável)', () => {
    expect(corPorComunidade('abc123')).toBe(corPorComunidade('abc123'));
  });

  it('devolve uma cor da paleta (formato hex)', () => {
    expect(corPorComunidade('qualquer-id')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('ids diferentes tendem a cores diferentes', () => {
    expect(corPorComunidade('id-um')).not.toBe(corPorComunidade('id-dois'));
  });

  it('não quebra com id vazio', () => {
    expect(corPorComunidade('')).toMatch(/^#[0-9a-f]{6}$/);
  });
});
