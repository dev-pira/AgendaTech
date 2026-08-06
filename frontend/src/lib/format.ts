export function truncar(texto: string, tamanho = 100) {
  return texto.length > tamanho ? `${texto.slice(0, tamanho).trimEnd()}…` : texto;
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(dataIso: string) {
  return new Date(dataIso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const rotuloTipoEvento: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
};

export const rotuloPapel: Record<string, string> = {
  organizador: 'Organizador',
  membro: 'Membro',
};
