import { useState } from 'react';
import { Check, Share2, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

const DURACAO_FEEDBACK_MS = 2000;

// navigator.share e navigator.clipboard só existem em "secure context"
// (HTTPS ou localhost) - a produção hoje é HTTP puro (ver issue #98), e
// nesse caso navigator.clipboard é undefined. Fallback via
// document.execCommand('copy') (API antiga, mas não exige secure context)
// pra continuar funcionando mesmo assim, em vez de quebrar silenciosamente.
function copiarViaFallback(texto: string): boolean {
  const area = document.createElement('textarea');
  area.value = texto;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok: boolean;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [estado, setEstado] = useState<'idle' | 'copiado' | 'falhou'>('idle');

  async function handleClick() {
    const linkCompartilhado = url ?? window.location.href;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url: linkCompartilhado });
      } catch (err) {
        // Usuário cancelou o share sheet nativo: não é um erro real, não exibimos mensagem.
        if (err instanceof Error && err.name === 'AbortError') return;
      }
      return;
    }

    let copiou = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(linkCompartilhado);
        copiou = true;
      } catch {
        copiou = false;
      }
    }
    if (!copiou) {
      copiou = copiarViaFallback(linkCompartilhado);
    }

    setEstado(copiou ? 'copiado' : 'falhou');
    setTimeout(() => setEstado('idle'), DURACAO_FEEDBACK_MS);
  }

  const rotulo =
    estado === 'copiado' ? 'Link copiado!' : estado === 'falhou' ? 'Não copiou' : 'Compartilhar';

  return (
    <Button
      variant="outline"
      size="sm"
      className="min-h-11"
      aria-label={rotulo}
      onClick={handleClick}
    >
      {estado === 'copiado' && <Check />}
      {estado === 'falhou' && <TriangleAlert />}
      {estado === 'idle' && <Share2 />}
      {rotulo}
    </Button>
  );
}
