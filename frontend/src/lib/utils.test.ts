import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('junta múltiplas classes em uma string', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('ignora valores falsy (uso comum em classes condicionais)', () => {
    const condicaoFalsa = 1 > 2;
    expect(cn('flex', condicaoFalsa && 'hidden', undefined, null, 'gap-2')).toBe('flex gap-2');
  });

  it('resolve conflitos do Tailwind mantendo a última classe (via tailwind-merge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
