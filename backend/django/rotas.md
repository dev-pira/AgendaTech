# Rotas do projeto Agenda Tech (Backend Django)

Este documento lista todas as rotas expostas pelo backend, divididas em duas superfícies que convivem no mesmo projeto Django (veja o [README.md](README.md) para o contexto geral):

- **Site (sem API)** — páginas HTML server-rendered, definidas em `src/core/urls.py` e servidas pelas views de `src/core/views.py`.
- **API REST** — endpoints `django-ninja` montados em `/api/`, definidos em `src/core/api.py`.

Todas as rotas do site e da API estão registradas em `src/agendatech/urls.py`, que inclui `admin/`, `api/` e `core.urls`.

---

## Site (páginas HTML)

| Método | Rota | Nome (`name=`) | Comentário |
|---|---|---|---|
| GET | `/` | `home` | Redireciona para a listagem de comunidades. |
| GET, POST | `/cadastro/` | `cadastro` | Formulário de criação de conta; já efetua login automático após o cadastro. |
| GET, POST | `/login/` | `login` | Tela de login padrão do Django (`LoginView`). |
| POST | `/logout/` | `logout` | Encerra a sessão do usuário logado. |
| GET | `/comunidades/` | `comunidade_list` | Lista pública de comunidades, com busca por nome e filtro por cidade. |
| GET, POST | `/comunidades/nova/` | `comunidade_create` | Cria uma comunidade (requer login); o criador vira organizador automaticamente. |
| GET | `/comunidades/<uuid:pk>/` | `comunidade_detail` | Detalhe da comunidade: membros e próximos eventos. |
| GET, POST | `/comunidades/<uuid:pk>/editar/` | `comunidade_update` | Edita a comunidade (requer ser organizador). |
| GET, POST | `/comunidades/<uuid:pk>/excluir/` | `comunidade_delete` | Exclui a comunidade (requer ser organizador; bloqueado se houver eventos futuros). |
| GET | `/eventos/` | `evento_list` | Lista pública de eventos, com filtros por comunidade, cidade, tipo e período. |
| GET, POST | `/eventos/novo/` | `evento_create` | Cria um evento (requer ser membro ou organizador de alguma comunidade). |
| GET | `/eventos/<uuid:pk>/` | `evento_detail` | Detalhe do evento. |
| GET, POST | `/eventos/<uuid:pk>/editar/` | `evento_update` | Edita o evento (requer ser organizador da comunidade; bloqueado para eventos passados). |
| GET, POST | `/eventos/<uuid:pk>/excluir/` | `evento_delete` | Exclui o evento (requer ser organizador da comunidade; bloqueado para eventos passados). |

## Administração

| Método | Rota | Comentário |
|---|---|---|
| GET, POST | `/admin/` | Django Admin padrão, para gerenciar todos os models via interface administrativa. |

## API REST (`django-ninja`)

Prefixo base: `/api/`. Documentação interativa (Swagger) em `/api/docs` e schema OpenAPI cru em `/api/openapi.json`. Rotas que exigem autenticação usam Bearer token (`Authorization: Bearer <token>`), obtido em `POST /api/auth/token`.

### Autenticação

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| POST | `/api/auth/token` | — | Autentica com `username`/`password` e retorna um token Bearer para uso nas rotas protegidas. |

### Comunidades

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| GET | `/api/comunidades` | — | Lista comunidades, com filtro opcional por `cidade` e paginação (`pagina`, `limite`). |
| GET | `/api/comunidades/{comunidade_id}` | — | Detalha uma comunidade, incluindo lista de membros. |
| POST | `/api/comunidades` | Bearer | Cria uma comunidade; o usuário autenticado vira organizador automaticamente. |
| PUT | `/api/comunidades/{comunidade_id}` | Bearer | Atualiza campos da comunidade (apenas organizadores). |
| DELETE | `/api/comunidades/{comunidade_id}` | Bearer | Exclui a comunidade (apenas organizadores; bloqueado se houver eventos futuros). |
| GET | `/api/comunidades/{comunidade_id}/eventos` | — | Lista os eventos de uma comunidade, com filtro por período e paginação. |

### Eventos

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| GET | `/api/eventos` | — | Lista eventos, com filtros por comunidade, cidade, tipo, período e paginação. |
| GET | `/api/eventos/{evento_id}` | — | Detalha um evento. |
| POST | `/api/eventos` | Bearer | Cria um evento em uma comunidade (requer ser membro ou organizador dela; data deve ser futura ou atual). |
| PUT | `/api/eventos/{evento_id}` | Bearer | Atualiza um evento (apenas organizadores da comunidade; bloqueado para eventos já ocorridos). |
| DELETE | `/api/eventos/{evento_id}` | Bearer | Exclui um evento (apenas organizadores da comunidade; bloqueado para eventos já ocorridos). |
