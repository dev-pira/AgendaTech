// O backend não devolve uma cor por comunidade (diferente do exemplo em
// docs/escopo-funcional.md) — geramos uma cor estável a partir do id.
const PALETA = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
];

export function corPorComunidade(comunidadeId: string) {
  let hash = 0;
  for (let i = 0; i < comunidadeId.length; i++) {
    hash = (hash << 5) - hash + comunidadeId.charCodeAt(i);
    hash |= 0;
  }
  return PALETA[Math.abs(hash) % PALETA.length];
}
