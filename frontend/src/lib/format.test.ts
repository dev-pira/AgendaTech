import { describe, expect, it } from 'vitest';

import { formatarData, rotuloPapel, rotuloTipoEvento, truncar } from './format';

describe('truncar', () => {
  it('devolve o texto original quando ele já cabe no tamanho', () => {
    expect(truncar('AgendaTech', 100)).toBe('AgendaTech');
  });

  it('corta e adiciona reticências quando o texto excede o tamanho', () => {
    const texto = 'Comunidade de desenvolvedores de Limeira e região';
    expect(truncar(texto, 10)).toBe('Comunidade…');
  });

  it('remove espaço em branco à direita do corte antes de adicionar as reticências', () => {
    expect(truncar('abc def ghi', 8)).toBe('abc def…');
  });

  it('usa 100 como tamanho padrão quando não informado', () => {
    const texto = 'x'.repeat(150);
    expect(truncar(texto)).toHaveLength(101); // 100 chars + '…'
  });
});

describe('formatarData', () => {
  it('converte ISO (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA)', () => {
    expect(formatarData('2026-08-12')).toBe('12/08/2026');
  });

  it('preserva zeros à esquerda em dia e mês', () => {
    expect(formatarData('2026-01-05')).toBe('05/01/2026');
  });
});

describe('rotuloTipoEvento', () => {
  it('mapeia os três tipos de evento suportados pelo backend', () => {
    expect(rotuloTipoEvento.presencial).toBe('Presencial');
    expect(rotuloTipoEvento.online).toBe('Online');
    expect(rotuloTipoEvento.hibrido).toBe('Híbrido');
  });
});

describe('rotuloPapel', () => {
  it('mapeia os papéis de membro de comunidade', () => {
    expect(rotuloPapel.organizador).toBe('Organizador');
    expect(rotuloPapel.membro).toBe('Membro');
  });
});
