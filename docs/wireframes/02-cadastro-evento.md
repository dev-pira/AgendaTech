# Wireframe: Cadastro de Evento

**Rota:** `/eventos/novo` (criação) ou `/eventos/:id/editar` (edição)  
**Acesso:** Membros e Organizadores (autenticados)

---

## Descrição Visual

Formulário de cadastro/edição de evento com campos organizados verticalmente, validação inline e campos condicionais baseados no tipo de evento selecionado.

---

## Layout ASCII

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏠 Agenda Tech    │ Comunidades │ Eventos │ Calendário │  [Perfil] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Comunidades > Eventos > Novo Evento                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  📝 Cadastrar Novo Evento                                  │   │
│  │                                                             │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │ Comunidade *                                          │ │   │
│  │  │ [DevLimeira                                        ▼] │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │ Título do Evento *                                    │ │   │
│  │  │ [                                                    ]│ │   │
│  │  │ 5 a 200 caracteres                                   │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │ Descrição *                                           │ │   │
│  │  │ ┌─────────────────────────────────────────────────┐  │ │   │
│  │  │ │                                                 │  │ │   │
│  │  │ │                                                 │  │ │   │
│  │  │ │                                                 │  │ │   │
│  │  │ └─────────────────────────────────────────────────┘  │ │   │
│  │  │ Mínimo 20 caracteres                                 │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌────────────────────────┐  ┌──────────────────────────┐ │   │
│  │  │ Data *                 │  │ Hora Início *            │ │   │
│  │  │ [📅 dd/mm/aaaa      ] │  │ [🕐 HH:MM             ] │ │   │
│  │  └────────────────────────┘  └──────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌────────────────────────┐                                │   │
│  │  │ Hora Fim               │                                │   │
│  │  │ [🕐 HH:MM           ] │                                │   │
│  │  │ (opcional)             │                                │   │
│  │  └────────────────────────┘                                │   │
│  │                                                             │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │ Tipo do Evento *                                      │ │   │
│  │  │  (●) Presencial   ( ) Online   ( ) Híbrido           │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │ Local *                                               │ │   │
│  │  │ [                                                    ]│ │   │
│  │  │ Endereço completo ou "Online"                         │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │ URL do Evento Online                                  │ │   │
│  │  │ [https://                                            ]│ │   │
│  │  │ ⚠️  Obrigatório para eventos online ou híbridos       │ │   │
│  │  └───────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │                                                     │   │   │
│  │  │       [  Cancelar  ]         [ 💾 Salvar Evento ]   │   │   │
│  │  │                                                     │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Estado de Validação (Erro)

```
┌───────────────────────────────────────────────────────────┐
│ Título do Evento *                                        │
│ [Ab ]                                                     │
│ ❌ O título deve ter entre 5 e 200 caracteres             │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ Data *                                                    │
│ [📅 01/01/2023    ]                                      │
│ ❌ A data do evento deve ser futura ou igual à data atual  │
└───────────────────────────────────────────────────────────┘
```

---

## Componentes

| # | Componente | Descrição |
|---|-----------|-----------|
| 1 | Header/Navegação | Barra superior com navegação global |
| 2 | Breadcrumb | Caminho de navegação: Comunidades > Eventos > Novo Evento |
| 3 | Título do formulário | "Cadastrar Novo Evento" ou "Editar Evento" |
| 4 | Dropdown Comunidade | Lista de comunidades das quais o usuário é membro/organizador |
| 5 | Campo Título | Input de texto com contador de caracteres |
| 6 | Campo Descrição | Textarea com contador de caracteres |
| 7 | Campo Data | Datepicker (aceita apenas datas futuras ou hoje) |
| 8 | Campo Hora Início | Time picker (obrigatório) |
| 9 | Campo Hora Fim | Time picker (opcional, deve ser posterior à hora início) |
| 10 | Seletor Tipo | Radio buttons: Presencial, Online, Híbrido |
| 11 | Campo Local | Input de texto para endereço |
| 12 | Campo URL Online | Input de URL (visível/obrigatório quando tipo = online ou híbrido) |
| 13 | Mensagens de Validação | Feedback inline abaixo de cada campo com erro |
| 14 | Botões de Ação | "Cancelar" (secundário) e "Salvar Evento" (primário) |

---

## Campos do Formulário

| Campo | Tipo Input | Obrigatório | Validação |
|-------|-----------|:-----------:|-----------|
| Comunidade | Dropdown | Sim | Apenas comunidades do usuário |
| Título | Text input | Sim | 5–200 caracteres |
| Descrição | Textarea | Sim | Mínimo 20 caracteres |
| Data | Datepicker | Sim | Data ≥ hoje |
| Hora Início | Time picker | Sim | Formato HH:MM |
| Hora Fim | Time picker | Não | Deve ser > Hora Início |
| Tipo | Radio buttons | Sim | presencial / online / híbrido |
| Local | Text input | Sim | Endereço ou "Online" |
| URL Online | URL input | Condicional | Obrigatório se tipo = online ou híbrido |

---

## Ações do Usuário

| Ação | Resultado | Navegação |
|------|-----------|-----------|
| Preencher campos | Validação inline em tempo real | — |
| Selecionar tipo "Online" ou "Híbrido" | Campo URL Online torna-se visível e obrigatório | — |
| Clicar "Salvar Evento" | Submete formulário (se válido) | → `/eventos/:id` |
| Clicar "Cancelar" | Descarta alterações | → página anterior |

---

## Notas de Comportamento

- O dropdown de comunidade lista **apenas** as comunidades das quais o usuário logado é membro ou organizador
- O campo "URL Online" é **oculto** quando o tipo selecionado é "Presencial"
- O campo "URL Online" torna-se **visível e obrigatório** quando tipo = "Online" ou "Híbrido"
- Validação ocorre no blur (saída do campo) e no submit
- No modo edição, os campos são pré-preenchidos com os dados atuais do evento
- Eventos passados **não podem** ser editados (formulário não acessível)
- Mensagens de erro aparecem em vermelho abaixo do campo correspondente
