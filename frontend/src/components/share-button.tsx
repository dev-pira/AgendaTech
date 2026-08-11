import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

const DURACAO_FEEDBACK_MS = 2000;

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copiado, setCopiado] = useState(false);

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

    await navigator.clipboard.writeText(linkCompartilhado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), DURACAO_FEEDBACK_MS);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="min-h-11"
      aria-label={copiado ? 'Link copiado!' : 'Compartilhar'}
      onClick={handleClick}
    >
      {copiado ? <Check /> : <Share2 />}
      {copiado ? 'Link copiado!' : 'Compartilhar'}
    </Button>
  );
}
