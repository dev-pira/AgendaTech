import type { ListaResponse } from '@/types/api';

/** Simula latência de rede pra transições/loading states não ficarem instantâneos demais. */
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function paginar<T>(itens: T[], pagina = 1, limite = 20): ListaResponse<T> {
  const total = itens.length;
  const inicio = (pagina - 1) * limite;
  return {
    dados: itens.slice(inicio, inicio + limite),
    paginacao: {
      pagina,
      limite,
      total,
      total_paginas: Math.max(1, Math.ceil(total / limite)),
    },
  };
}
