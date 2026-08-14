import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ShareButton } from './share-button';

// Ver #30 ([Test Coverage]) - share-button.tsx estava em 0%. navigator.share
// e navigator.clipboard não existem por padrão no jsdom, então cada teste
// define só o que precisa via Object.defineProperty (configurable, pra
// poder remover/trocar entre testes).
function definirShare(fn?: (data: ShareData) => Promise<void>) {
  Object.defineProperty(navigator, 'share', { value: fn, configurable: true });
}
function definirClipboard(writeText?: (t: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  definirShare(undefined);
  definirClipboard(undefined);
});

describe('ShareButton - com navigator.share (mobile/PWA)', () => {
  it('chama navigator.share com título, texto e url', async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    definirShare(share);

    render(
      <ShareButton title="Meetup React" text="Meetup React — Agenda Tech" url="https://x.com/e1" />,
    );
    await user.click(screen.getByRole('button', { name: 'Compartilhar' }));

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: 'Meetup React',
        text: 'Meetup React — Agenda Tech',
        url: 'https://x.com/e1',
      }),
    );
  });

  it('não mostra erro quando o usuário cancela o share sheet nativo (AbortError)', async () => {
    const user = userEvent.setup();
    const erroAbort = Object.assign(new Error('cancelado'), { name: 'AbortError' });
    definirShare(vi.fn().mockRejectedValue(erroAbort));

    render(<ShareButton title="Meetup React" />);
    await user.click(screen.getByRole('button', { name: 'Compartilhar' }));

    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Compartilhar'));
  });
});

describe('ShareButton - sem navigator.share, com clipboard (desktop)', () => {
  it('copia o link e mostra "Link copiado!"', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirClipboard(writeText);

    render(<ShareButton title="Meetup React" url="https://x.com/e1" />);
    await user.click(screen.getByRole('button', { name: 'Compartilhar' }));

    expect(await screen.findByText('Link copiado!')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith('https://x.com/e1');
  });
});

describe('ShareButton - sem share nem clipboard (fallback execCommand)', () => {
  it('usa o fallback e mostra "Link copiado!" quando execCommand funciona', async () => {
    const user = userEvent.setup();
    // userEvent.setup() instala seu próprio navigator.clipboard funcional
    // (suporte a paste/copy) - precisa ser desligado de novo aqui, depois
    // do setup(), pra forçar o caminho do fallback (execCommand) que
    // queremos testar.
    definirClipboard(undefined);
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => true),
      configurable: true,
    });

    render(<ShareButton title="Meetup React" url="https://x.com/e1" />);
    await user.click(screen.getByRole('button', { name: 'Compartilhar' }));

    expect(await screen.findByText('Link copiado!')).toBeInTheDocument();
  });

  it('mostra "Não copiou" quando nem o fallback funciona', async () => {
    const user = userEvent.setup();
    definirClipboard(undefined);
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => false),
      configurable: true,
    });

    render(<ShareButton title="Meetup React" url="https://x.com/e1" />);
    await user.click(screen.getByRole('button', { name: 'Compartilhar' }));

    expect(await screen.findByText('Não copiou')).toBeInTheDocument();
  });
});
