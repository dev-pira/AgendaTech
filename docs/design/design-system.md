# Design System — Agenda Tech

Regras de design adotadas para o frontend, adaptadas do
[`DESIGN.md` da Apple](https://getdesign.md/apple/design-md) (via
[getdesign.md](https://getdesign.md/), coleção de sistemas de design legíveis por IA) para o
contexto deste produto. É a referência que o agente `ui-designer` (ver
[`docs/development/team.md`](../development/team.md)) usa para aprovar ou reprovar uma tela.

## Por que a Apple como referência, e o que muda

O `DESIGN.md` original descreve o **site de marketing** da Apple (apple.com): fotografia de
produto em tela cheia, tiles alternando claro/escuro, hero headlines de 56px. O Agenda Tech é um
**app de produtividade orientado a dados** (listagens, formulários, tabelas, calendário) — não um
site institucional. Importamos os **princípios de clareza e comedimento visual**, não o layout de
marketing.

| Herdamos da Apple | Não se aplica aqui |
|---|---|
| Paleta neutra com **um único** acento de interação | Tiles de produto em tela cheia com fotografia |
| Escala tipográfica com hierarquia clara e tracking ajustado em títulos | Alternância de seções claro/escuro como "divisor" de página |
| Grid de espaçamento em base 8px | Headlines de 40–56px (nosso conteúdo é denso, não uma vitrine) |
| Raio de borda consistente por função (utilitário vs. ação) | — |
| Regra de sombra única — elevação vem de mudança de superfície, não de `box-shadow` decorativo | — |
| Alvo de toque mínimo 44×44px, breakpoints estruturados | — |
| Micro-interação de "active" consistente (`scale(0.95)`) | — |

## Princípios (adaptados dos 3 pilares da Apple: clareza, deferência, profundidade)

1. **Clareza** — hierarquia tipográfica faz o trabalho, não decoração. Um dado importante é maior
   e mais escuro, não colorido.
2. **Deferência** — a interface recua para os dados do usuário (nome da comunidade, título do
   evento). Chrome de UI (bordas, ícones, badges) é mínimo e funcional.
3. **Profundidade com moderação** — no máximo um nível de elevação por vez. Sem sombras
   decorativas empilhadas.

## Tokens

Já implementados em `frontend/src/index.css` (tema shadcn/ui `new-york`, cores em OKLCH,
suporte a dark mode nativo via classe `.dark`). Esta seção documenta a **intenção** por trás dos
tokens existentes — não introduz tokens novos.

### Cor

- **Um único acento de interação** (`--primary`) para todo elemento clicável: botões primários,
  links, foco de teclado. Não introduzir uma segunda cor de destaque — é a regra mais importante
  herdada da Apple ("every click-me signal is the same color").
- `--destructive` só para ações irreversíveis (excluir comunidade, remover membro, excluir
  evento) — nunca para ênfase visual comum.
- Cores de comunidade no calendário (`src/lib/colors.ts`) são a **única** exceção à regra de "um
  acento": servem para diferenciar dados, não para sinalizar interatividade.
- Contraste mínimo **WCAG AA** (4.5:1 para texto normal, 3:1 para texto grande/ícones) em ambos
  os temas claro e escuro.

### Tipografia

- Fonte do sistema (`-apple-system, system-ui, ...` com fallback para **Inter** em plataformas
  sem SF Pro) — já é o padrão do navegador, nenhuma mudança necessária.
- Corpo de texto em **texto legível por padrão** (não abaixo de 14px em conteúdo primário).
- Peso 600 para títulos de seção/card, 400 para corpo, 500 nunca usado sozinho como ênfase
  (seguindo a régua da Apple: 300/400/600/700 — 500 fica reservado a casos pontuais do
  Tailwind/shadcn que já usamos, não é uma regra rígida aqui como é no site da Apple).
- Tracking (letter-spacing) neutro — a densidade de dados de um CRUD não pede o "Apple tight"
  característico de headlines de marketing.

### Espaçamento

- Grid base **8px** — já é o comportamento padrão da escala do Tailwind (`gap-2` = 8px, `gap-4` =
  16px, `gap-6` = 24px). Manter consistência: não introduzir valores fora da escala do Tailwind
  (nada de `margin: 13px`).
- Cards/formulários usam `padding` de `24px` (`p-5`/`p-6`) como no `store-utility-card` da Apple.
- Seções de página com respiro vertical de `24–32px` entre blocos (`gap-6`/`gap-8`), nunca
  espremidas.

### Raio de borda

| Uso | Token Tailwind | Equivalente Apple |
|---|---|---|
| Inputs, botões utilitários, cards | `rounded-md` (`--radius-md`) | `rounded.sm`/`rounded.md` |
| Cards de conteúdo, modais | `rounded-lg`/`rounded-xl` | `rounded.lg` |
| Badges, pills de status | `rounded-md` a `rounded-full` conforme já implementado | `rounded.pill` |

Não misturar gramáticas de raio na mesma tela — mesma regra da Apple ("don't mix radii
grammars").

### Elevação

- **Regra da sombra única**: cards usam `shadow-sm` (sutil, quase imperceptível) — já é o que
  `src/components/ui/card.tsx` faz. Não adicionar `shadow-md`/`shadow-lg` a cards, botões ou
  badges.
- Modais (`Dialog`) usam `shadow-lg` — é a única elevação "forte" permitida, porque comunica
  sobreposição de camada (overlay), não decoração.
- Hover em cards clicáveis (listagem de comunidades/eventos) muda a **borda** (`hover:border-primary`,
  já implementado), não adiciona sombra — evita ruído visual em listas longas.

## Componentes (mapeados aos componentes shadcn/ui já implementados)

| Componente Apple | Equivalente no Agenda Tech | Onde |
|---|---|---|
| `button-primary` (pill, ação principal) | `<Button>` variant `default` | Salvar formulário, criar comunidade/evento |
| `button-secondary-pill` (ghost com borda) | `<Button>` variant `outline` | Cancelar, ações secundárias |
| `button-dark-utility` (compacto, utilitário) | `<Button>` variant `secondary`/`ghost` size `sm` | Ações de tabela (Promover/Rebaixar) |
| — (não existe na Apple) | `<Button>` variant `destructive` | Excluir, Remover — sempre com confirmação |
| `store-utility-card` | `<Card>` | Card de comunidade/evento na listagem |
| `configurator-option-chip` | `<Badge>` | Papel do membro, tipo do evento |
| `search-input` (pill) | `<Input>` | Busca e filtros — considerar migrar para `rounded-full` em campos de busca livre (hoje `rounded-md`, ver backlog de UI) |
| micro-interação `scale(0.95)` no active | Ainda não implementado — ver backlog de UI abaixo | — |

## Responsividade

- **Breakpoints** seguem o padrão Tailwind (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px) — já
  em uso nas grades de listagem (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- **Alvo de toque mínimo 44×44px** em qualquer elemento interativo em telas ≤768px — os botões
  `size="sm"` (h-8/32px) usados em ações de tabela **não atendem isso em mobile** e são um item
  de backlog de acessibilidade (ver abaixo).
- Tabelas (`Table` em `membros-page.tsx`) devem permanecer roláveis horizontalmente em telas
  estreitas (`overflow-x-auto`, já implementado em `components/ui/table.tsx`) — nunca quebrar
  linha de forma ilegível.
- Formulários em coluna única sempre, independente do breakpoint (já implementado com
  `max-w-lg` + `flex-col`) — Apple e boas práticas de formulário concordam: formulário de duas
  colunas prejudica leitura em qualquer largura.

## Do's e Don'ts

### Faça
- Use `--primary` para todo elemento clicável comum; nada mais.
- Prefira mudar a borda/peso de fonte a adicionar sombra para indicar interatividade.
- Mantenha `gap`/`padding` na escala do Tailwind (múltiplos de 4px, preferencialmente de 8px).
- Use `<Badge variant="destructive">` só para estados que exigem atenção real (erro), não para
  decoração.
- Confirme sempre (`confirm()` ou modal) antes de ações destrutivas — já é o padrão em
  `handleExcluir`/`handleRemover` nas páginas existentes.

### Não faça
- Não introduza uma segunda cor de "ação" (ex.: um botão azul e outro verde com o mesmo peso de
  importância).
- Não empilhe `shadow-md` + borda colorida + hover de fundo no mesmo componente — escolha um
  sinal de interatividade por vez.
- Não use texto abaixo de `text-xs` (12px) para informação que o usuário precisa ler, só para
  metadados verdadeiramente secundários.
- Não crie um novo componente visual quando um dos componentes em `src/components/ui/` já cobre
  o caso — extensão via `variant`/`className`, não duplicação.

## Backlog de auditoria de UI

Itens identificados ao escrever este documento que ainda **não** estão em conformidade —
registrados aqui para o `ui-designer` revisar em uma futura iteração, não bloqueiam o estado
atual:

1. Botões `size="sm"` em ações de tabela (`membros-page.tsx`) ficam abaixo do alvo de toque de
   44px em mobile.
2. Inputs de busca (`Input` de texto livre em listagens) poderiam adotar `rounded-full` para
   reforçar visualmente "isto é busca", diferenciando de campos de formulário estruturado.
3. Nenhum componente ainda implementa a micro-interação de `active:scale-95` — avaliar se vale a
   pena para botões primários (ganho de "app nativo" vs. custo de implementação/teste).
4. Não há verificação automatizada de contraste WCAG AA no design system atual — considerar
   lint de acessibilidade (`eslint-plugin-jsx-a11y`) no `ui-designer` ou CI.
