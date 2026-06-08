# Wireframe: Listagem de Comunidades

**Rota:** `/comunidades`  
**Acesso:** Todos (visitante, membro, organizador)

---

## Descrição Visual

Página principal de listagem de comunidades, exibindo cards em grid responsivo com informações resumidas de cada comunidade cadastrada.

---

## Layout ASCII

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏠 Agenda Tech    │ Comunidades │ Eventos │ Calendário │  [Login]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Comunidades de Tecnologia                    [+ Nova Comunidade]   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar por nome...              │ Cidade: [Todas ▼]     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  ┌────┐          │  │  ┌────┐          │  │  ┌────┐          │ │
│  │  │logo│  DEVPIRA  │  │  │logo│DevLimeira│  │  │logo│DevRioClaro│ │
│  │  └────┘          │  │  └────┘          │  │  └────┘          │ │
│  │                   │  │                   │  │                   │ │
│  │  📍 Piracicaba   │  │  📍 Limeira      │  │  📍 Rio Claro    │ │
│  │                   │  │                   │  │                   │ │
│  │  Comunidade de    │  │  Comunidade de    │  │  Comunidade de    │ │
│  │  desenvolvedores  │  │  desenvolvedores  │  │  desenvolvedores  │ │
│  │  de Piracicab...  │  │  de Limeira...    │  │  de Rio Clar...   │ │
│  │                   │  │                   │  │                   │ │
│  │  👥 42 membros   │  │  👥 35 membros   │  │  👥 28 membros   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  ┌──────────────────┐                                              │
│  │  ┌────┐          │                                              │
│  │  │logo│  DevItape │                                              │
│  │  └────┘          │                                              │
│  │                   │                                              │
│  │  📍 Itapetininga │                                              │
│  │                   │                                              │
│  │  Comunidade de    │                                              │
│  │  desenvolvedores  │                                              │
│  │  de Itapetini...  │                                              │
│  │                   │                                              │
│  │  👥 20 membros   │                                              │
│  └──────────────────┘                                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ← Anterior    Página 1 de 3    Próxima →                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Componentes

| # | Componente | Descrição |
|---|-----------|-----------|
| 1 | Header/Navegação | Barra superior com logo, links de navegação (Comunidades, Eventos, Calendário) e botão Login/Perfil |
| 2 | Título + Botão Nova | Título da página com botão "Nova Comunidade" (visível apenas para usuários autenticados) |
| 3 | Barra de Filtros | Campo de busca por nome e dropdown de filtro por cidade |
| 4 | Grid de Cards | Cards de comunidade em layout grid responsivo (3 colunas em desktop, 1 em mobile) |
| 5 | Card de Comunidade | Logo, nome, cidade, descrição resumida (100 chars), total de membros |
| 6 | Paginação | Controles de navegação entre páginas |

---

## Dados Exibidos por Card

- Logo da comunidade (imagem ou placeholder)
- Nome da comunidade
- Cidade (com ícone de localização)
- Descrição resumida (primeiros 100 caracteres)
- Total de membros

---

## Ações do Usuário

| Ação | Resultado | Navegação |
|------|-----------|-----------|
| Buscar por nome | Filtra cards em tempo real | — |
| Filtrar por cidade | Filtra cards pela cidade selecionada | — |
| Clicar em um card | Navega para detalhes | → `/comunidades/:id` |
| Clicar "Nova Comunidade" | Navega para formulário de criação | → `/comunidades/nova` |
| Navegar páginas | Carrega próxima/anterior página | — |

---

## Notas de Comportamento

- O botão "Nova Comunidade" é **oculto** para visitantes (não autenticados)
- A busca filtra pelo campo `nome` (case-insensitive)
- O filtro de cidade lista apenas cidades que possuem comunidades cadastradas
- Cards são clicáveis por inteiro (toda a área do card é um link)
- Descrição é truncada em 100 caracteres com "..."
