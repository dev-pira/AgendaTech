# Princípios de Engenharia

Clean Code, SOLID e Acessibilidade aplicados ao stack real deste projeto (React 19 + TypeScript
+ Vite no frontend, Node/Express/Prisma no backend) — não uma cópia genérica dos princípios,
mas o que eles significam neste código. É a régua que o agente
[`code-reviewer`](../../.claude/agents/code-reviewer.md) usa.

## Clean Code

- **Nomes em português, consistentes com o domínio já estabelecido**: `criarComunidade`, não
  `createComunidade` nem `criarCommunity`. O código já mistura domínio em português (nomes de
  entidade, regras de negócio RN-*) com stack em inglês (React, TypeScript) — não inverta essa
  convenção em código novo.
- **Funções pequenas, uma responsabilidade**: um `service` faz uma chamada HTTP (ou delega ao
  mock), uma função em `lib/format.ts` formata um valor, um componente de página orquestra
  estado + chama services — não misture as três coisas na mesma função.
- **Comentários só para o não-óbvio**: uma decisão de arquitetura, uma regra de negócio (RN-*)
  sendo replicada, uma divergência conhecida entre a doc e o comportamento real. Nunca um
  comentário que só repete o que o código já diz.
- **Sem código morto**: import não usado, função exportada que nada importa, branch
  inalcançável — remova, não comente.

## SOLID (adaptado a React/TypeScript, não OOP clássico)

- **Single Responsibility**: um hook cuida de um pedaço de estado/efeito (`useAuth`), um
  componente de UI genérico (`src/components/ui/`) não sabe nada sobre comunidades ou eventos, um
  componente de página orquestra e delega.
- **Open/Closed**: componentes de UI genéricos se estendem via `variant`/`className`/composição
  (padrão `cva` já usado em `button.tsx`/`badge.tsx`), nunca acumulando `if (tipo === 'x')`
  dentro de um componente que deveria ser agnóstico ao domínio.
- **Liskov**: não aplicável na forma clássica (sem herança de classes no projeto) — o
  equivalente aqui é: um componente que aceita `EventoInput` deve funcionar com qualquer
  `EventoInput` válido, sem assumir campos extras que só existem em um caso de uso específico.
- **Interface Segregation**: tipos de `src/types/api.ts` são o contrato mínimo necessário — não
  adicione campos "por via das dúvidas" que nenhum consumidor real usa.
- **Dependency Inversion**: páginas dependem de `src/services/*.ts` (abstração), nunca chamam
  `fetch` diretamente ou importam de `src/mocks/` fora dos próprios arquivos de serviço — é o
  que permite o toggle `VITE_USE_MOCK` funcionar sem tocar em nenhuma página.

## Acessibilidade (WCAG AA)

- Todo campo de formulário tem `<Label htmlFor>` associado — já é o padrão em todas as páginas
  de formulário existentes; mantenha.
- Contraste mínimo 4.5:1 (texto normal) / 3:1 (texto grande, ícones) nos temas claro e escuro —
  os tokens de `index.css` já foram escolhidos com isso em mente; não sobrescreva com cores
  arbitrárias via `style` inline.
- Alvo de toque mínimo 44×44px em elementos interativos visíveis em mobile (ver backlog de
  auditoria em `docs/design/design-system.md` — nem tudo no código atual atende isso ainda).
- Ações destrutivas sempre pedem confirmação antes de executar (`confirm()` ou modal) — já é o
  padrão em `handleExcluir`/`handleRemover`.
- Erros de formulário são anunciados visualmente perto do campo/ação relevante (texto vermelho
  já usado), não só via `alert()` ou console.

## Onde isso é cobrado

O agente `code-reviewer` audita todo diff contra esta lista antes do commit. Achados que
resultam em bug real ou inconsistência com um padrão já estabelecido no projeto são bloqueantes;
preferência de estilo sem impacto funcional não é.
