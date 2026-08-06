# Diagrama ER — Agenda Tech (Backend)

> Referente à tarefa [2.1 Modelagem de Dados](../backend/laravel/database/migrations) (DevLimeira, MS2: Backend API).
> Schema implementado em `backend/laravel/database/migrations` (Laravel 11 / PostgreSQL, ver [`docs/stack.md`](./stack.md)).

## Diagrama

```mermaid
erDiagram
    USERS ||--o{ COMUNIDADES : "cria (criado_por_id)"
    USERS ||--o{ COMUNIDADE_MEMBROS : "participa (usuario_id)"
    USERS ||--o{ COMUNIDADE_MEMBROS : "adiciona (adicionado_por_id)"
    USERS ||--o{ EVENTOS : "organiza (organizador_id)"
    USERS ||--o| TOKENS : "autentica"

    COMUNIDADES ||--o{ COMUNIDADE_MEMBROS : "possui"
    COMUNIDADES ||--o{ EVENTOS : "promove"

    USERS {
        uuid id PK
        string username UK
        string email UK
        string first_name
        string last_name
        string password
        timestamp email_verified_at
    }

    COMUNIDADES {
        uuid id PK
        string nome UK "case-insensitive, RN-COM-06"
        text descricao
        string cidade
        string contato
        string logo_url
        uuid criado_por_id FK
    }

    COMUNIDADE_MEMBROS {
        bigint id PK
        uuid comunidade_id FK
        uuid usuario_id FK
        enum papel "organizador | membro"
        timestamp adicionado_em
        uuid adicionado_por_id FK
    }

    EVENTOS {
        uuid id PK
        string titulo
        text descricao
        date data
        time hora_inicio
        time hora_fim
        string local
        enum tipo "presencial | online | hibrido"
        string url_online
        uuid comunidade_id FK
        uuid organizador_id FK
    }

    TOKENS {
        bigint id PK
        uuid user_id FK, UK
        string key UK
    }
```

## Cardinalidades

| Relacionamento | Cardinalidade | Observação |
|---|---|---|
| Comunidade → Eventos | 1:N | `eventos.comunidade_id`, `cascadeOnDelete` |
| Comunidade ↔ Usuários (membros) | N:M | via `comunidade_membros`, pivot com `papel` (`organizador`/`membro`) — implementa o papel de "Organizador" da comunidade, em vez de uma entidade `Organizador` separada |
| Usuário → Eventos (organizador) | 1:N | `eventos.organizador_id`, `restrictOnDelete` |
| Usuário → Comunidades (criador) | 1:N | `comunidades.criado_por_id`, `restrictOnDelete` |
| Usuário → Token | 1:1 | `tokens.user_id`, único |

## Constraints e regras de negócio refletidas no schema

| Regra | Onde está implementada |
|---|---|
| RN-COM-06 — nome de comunidade único (case-insensitive) | Índice único `comunidades_nome_ci_unique` (collation `NOCASE` no SQLite; `unique('nome')` nos demais drivers) |
| RN-EVT-09 — evento não pode duplicar título+data na mesma comunidade | Índice único composto `unique_evento_titulo_data_por_comunidade` (`comunidade_id`, `titulo`, `data`) |
| Um usuário não pode ser membro duplicado da mesma comunidade | Índice único composto `unique_membro_por_comunidade` (`comunidade_id`, `usuario_id`) |
| RN-COM-08 — criador de uma comunidade é automaticamente seu organizador | Aplicado em `ComunidadeController::store` (camada de aplicação, não no schema) |

## Nota sobre desvio em relação ao WBS original

O texto de critérios de aceitação da issue #20 (copiado de `docs/wbs.md`) lista os campos `website` e `data_criacao` em `Comunidade`, e uma entidade `Organizador` separada. O schema implementado segue a versão mais recente e detalhada da spec funcional (`docs/escopo-funcional.md`, seção 2.5 "Regras de Negócio", RN-COM-01 a RN-COM-10), que substitui `website`/`data_criacao` por `cidade`/`contato` e resolve "organizador" como um **papel** dentro de `comunidade_membros`, não como entidade própria. `docs/wbs.md` está desatualizado nesse ponto — vale alinhar numa próxima revisão do WBS.
