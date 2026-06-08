# Wireframe: Calendário Compartilhado

**Rota:** `/calendario`  
**Acesso:** Todos (visitante, membro, organizador)

---

## Descrição Visual

Visualização em formato de calendário mensal com eventos de todas as comunidades. Cada evento é representado como um bloco colorido (cor da comunidade) dentro do dia correspondente. Painel lateral de filtros permite refinar a visualização por comunidade, cidade e tipo de evento.

---

## Layout ASCII — Visão Mensal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏠 Agenda Tech    │ Comunidades │ Eventos │ Calendário │  [Login]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📅 Calendário de Eventos                                              │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Filtros                                                         │  │
│  │                                                                  │  │
│  │  Comunidade:  [Todas               ▼]                           │  │
│  │  Cidade:      [Todas               ▼]                           │  │
│  │  Tipo:        [Todos               ▼]                           │  │
│  │                                                                  │  │
│  │  ☑ DEVPIRA  ☑ DevLimeira  ☑ DevRioClaro  ☑ DevItape            │  │
│  │  (🟣 roxo)  (🟢 verde)    (🔴 vermelho)  (🔵 azul)             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │  [◀ Anterior]       Março 2024         [Próximo ▶]  [Hoje]      │  │
│  │                                                                  │  │
│  ├────────┬────────┬────────┬────────┬────────┬────────┬────────┤  │
│  │  DOM   │  SEG   │  TER   │  QUA   │  QUI   │  SEX   │  SAB   │  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │        │        │        │        │        │   1    │   2    │  │
│  │        │        │        │        │        │        │        │  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │   3    │   4    │   5    │   6    │   7    │   8    │   9    │  │
│  │        │        │ ┌────┐ │        │        │        │        │  │
│  │        │        │ │🟢MT│ │        │        │        │        │  │
│  │        │        │ └────┘ │        │        │        │        │  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │  10    │  11    │  12    │  13    │  14    │  15    │  16    │  │
│  │        │        │        │ ┌────┐ │        │ ┌────┐ │        │  │
│  │        │        │        │ │🟣TT│ │        │ │🔵WS│ │        │  │
│  │        │        │        │ └────┘ │        │ └────┘ │        │  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │  17    │  18    │  19    │  20    │  21    │  22    │  23    │  │
│  │        │        │        │ ┌────┐ │        │        │ ┌────┐ │  │
│  │        │        │        │ │🟢RE│ │        │        │ │🔴CD│ │  │
│  │        │        │        │ │🔵FE│ │        │        │ └────┘ │  │
│  │        │        │        │ └────┘ │        │        │        │  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │  24    │  25    │  26    │  27    │  28    │  29    │  30    │  │
│  │        │ ┌────┐ │        │        │        │        │        │  │
│  │        │ │🟣HK│ │        │        │        │        │        │  │
│  │        │ └────┘ │        │        │        │        │        │  │
│  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │  31    │        │        │        │        │        │        │  │
│  │        │        │        │        │        │        │        │  │
│  └────────┴────────┴────────┴────────┴────────┴────────┴────────┘  │
│                                                                         │
│  Legenda: 🟣 DEVPIRA  🟢 DevLimeira  🔴 DevRioClaro  🔵 DevItape     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layout ASCII — Popup de Evento (ao clicar em um evento no calendário)

```
┌─────────────────────────────────────────┐
│  Meetup React Avançado                  │
│                                         │
│  📅 20/03/2024                          │
│  🕐 19:00 - 21:00                       │
│  📍 Rua Dev, 123 - Centro              │
│  🏷️  Presencial                         │
│  🏠 DevLimeira                          │
│                                         │
│  [Ver Detalhes]          [✕ Fechar]     │
└─────────────────────────────────────────┘
```

---

## Componentes

| # | Componente | Descrição |
|---|-----------|-----------|
| 1 | Header/Navegação | Barra superior com navegação global |
| 2 | Título da página | "Calendário de Eventos" |
| 3 | Painel de Filtros | Dropdowns de comunidade, cidade e tipo + checkboxes de comunidade com cores |
| 4 | Controles de Navegação | Botões Anterior/Próximo mês, botão "Hoje" para voltar ao mês atual |
| 5 | Indicador de Mês/Ano | Exibe mês e ano atualmente visualizado |
| 6 | Grade do Calendário | Grid 7x5 (ou 7x6) com dias do mês |
| 7 | Blocos de Evento | Pequenos blocos coloridos dentro das células do dia, com sigla do evento |
| 8 | Popup de Evento | Card flutuante com resumo do evento ao clicar em um bloco |
| 9 | Legenda de Cores | Mapeamento cor → comunidade abaixo do calendário |

---

## Dados Exibidos

### Na Grade do Calendário
- Número do dia
- Blocos de eventos com cor da comunidade e sigla/abreviação do título

### No Popup de Evento
- Título completo do evento
- Data
- Horário (início e fim)
- Local
- Tipo (badge: presencial/online/híbrido)
- Nome da comunidade
- Link "Ver Detalhes"

---

## Filtros Disponíveis

| Filtro | Tipo | Opções |
|--------|------|--------|
| Comunidade | Dropdown | Todas, DEVPIRA, DevLimeira, DevRioClaro, DevItape |
| Cidade | Dropdown | Todas, + cidades com eventos cadastrados |
| Tipo | Dropdown | Todos, Presencial, Online, Híbrido |
| Checkboxes de comunidade | Toggle | Liga/desliga visibilidade de cada comunidade |

---

## Ações do Usuário

| Ação | Resultado | Navegação |
|------|-----------|-----------|
| Navegar meses (◀/▶) | Carrega eventos do mês anterior/próximo | — |
| Clicar "Hoje" | Retorna ao mês atual | — |
| Selecionar filtro (dropdown) | Filtra eventos visíveis no calendário | — |
| Toggle checkbox de comunidade | Mostra/oculta eventos da comunidade | — |
| Clicar em bloco de evento | Exibe popup com resumo do evento | — |
| Clicar "Ver Detalhes" (popup) | Navega para página de detalhes | → `/eventos/:id` |

---

## Código de Cores por Comunidade

| Comunidade | Cor | Hex |
|-----------|-----|-----|
| DEVPIRA | Roxo | `#7B68EE` |
| DevLimeira | Verde | `#2E8B57` |
| DevRioClaro | Vermelho | `#FF6347` |
| DevItape | Azul | `#4169E1` |

---

## Notas de Comportamento

- O calendário exibe eventos de **todas** as comunidades por padrão
- Eventos são representados como pequenos blocos coloridos dentro da célula do dia
- Se houver mais de 3 eventos no mesmo dia, exibir "+N mais" com link para expandir
- O popup aparece ao clicar em um bloco de evento (não no hover, para suporte mobile)
- Filtros são combináveis (ex: comunidade "DevLimeira" + tipo "Presencial")
- Os checkboxes de comunidade permitem toggle rápido sem usar o dropdown
- A navegação por mês preserva os filtros selecionados
- Dia atual é destacado visualmente (borda ou fundo diferenciado)
- O calendário é acessível via teclado (navegação por setas entre dias)
