# Rotas do projeto Agenda Tech (Backend Rails)

Este documento lista todas as rotas expostas por esta versão Ruby on Rails do backend — a mesma superfície de endpoints das versões [Django](../django/rotas.md) e [Laravel](../laravel/rotas.md), reimplementada com os mesmos recursos.

- **Site (sem API)** — páginas HTML server-rendered, definidas em `config/routes.rb` e servidas pelos controllers `SessionsController`, `RegistrationsController`, `ComunidadesController` e `EventosController`.
- **API REST** — endpoints JSON montados em `/api/`, definidos no bloco `namespace :api` de `config/routes.rb` e servidos pelos controllers `Api::*`.

Assim como a versão Laravel, o Rails ignora barra final na definição de rota, então os caminhos abaixo não têm `/` no final (diferente da versão Django, que usa `/comunidades/` etc.).

---

## Site (páginas HTML)

| Método | Rota | Nome da rota | Comentário |
|---|---|---|---|
| GET | `/` | `root` | Redireciona para a listagem de comunidades. |
| GET | `/cadastro` | `cadastro` | Formulário de criação de conta. |
| POST | `/cadastro` | — | Cria a conta e já efetua login automático. |
| GET | `/login` | `login` | Formulário de login. |
| POST | `/login` | — | Autentica o usuário via sessão. |
| POST, DELETE | `/logout` | `logout` | Encerra a sessão do usuário logado. |
| GET | `/comunidades` | `comunidades` | Lista pública de comunidades, com busca por nome e filtro por cidade. |
| GET | `/comunidades/nova` | `new_comunidade` | Formulário de criação de comunidade (requer login). |
| POST | `/comunidades/nova` | — | Cria a comunidade (requer login); o criador vira organizador automaticamente. |
| GET | `/comunidades/:id` | `comunidade` | Detalhe da comunidade: membros e próximos eventos. |
| GET | `/comunidades/:id/editar` | `edit_comunidade` | Formulário de edição (requer ser organizador). |
| PUT | `/comunidades/:id/editar` | — | Atualiza a comunidade (requer ser organizador). |
| GET | `/comunidades/:id/excluir` | `confirm_delete_comunidade` | Página de confirmação de exclusão. |
| DELETE | `/comunidades/:id/excluir` | — | Exclui a comunidade (requer ser organizador; bloqueado se houver eventos futuros). |
| GET | `/eventos` | `eventos` | Lista pública de eventos, com filtros por comunidade, cidade, tipo e período. |
| GET | `/eventos/novo` | `new_evento` | Formulário de criação de evento (requer ser membro de alguma comunidade). |
| POST | `/eventos/novo` | — | Cria o evento (requer ser membro ou organizador da comunidade escolhida). |
| GET | `/eventos/:id` | `evento` | Detalhe do evento. |
| GET | `/eventos/:id/editar` | `edit_evento` | Formulário de edição (requer ser organizador; bloqueado para eventos passados). |
| PUT | `/eventos/:id/editar` | — | Atualiza o evento (requer ser organizador; bloqueado para eventos passados). |
| GET | `/eventos/:id/excluir` | `confirm_delete_evento` | Página de confirmação de exclusão. |
| DELETE | `/eventos/:id/excluir` | — | Exclui o evento (requer ser organizador; bloqueado para eventos passados). |
| GET | `/up` | `rails_health_check` | Health check padrão do Rails (200 se a aplicação subiu). |

## Administração

Esta versão não inclui um painel administrativo equivalente ao Django Admin (nem ao ActiveAdmin/Avo, que exigiriam gems extras). Para inspecionar/editar dados diretamente, use `bin/rails console` ou um cliente MySQL (`mysql`, DBeaver, TablePlus etc.).

## API REST

Prefixo base: `/api/`. Rotas que exigem autenticação usam Bearer token (`Authorization: Bearer <token>`), obtido em `POST /api/auth/token`.

### Autenticação

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| POST | `/api/auth/token` | — | Autentica com `username`/`password` e retorna um token Bearer para uso nas rotas protegidas. |

### Comunidades

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| GET | `/api/comunidades` | — | Lista comunidades, com filtro opcional por `cidade` e paginação (`pagina`, `limite`). |
| GET | `/api/comunidades/:id` | — | Detalha uma comunidade, incluindo lista de membros. |
| POST | `/api/comunidades` | Bearer | Cria uma comunidade; o usuário autenticado vira organizador automaticamente. |
| PUT | `/api/comunidades/:id` | Bearer | Atualiza campos da comunidade (apenas organizadores). |
| DELETE | `/api/comunidades/:id` | Bearer | Exclui a comunidade (apenas organizadores; bloqueado se houver eventos futuros). |
| GET | `/api/comunidades/:id/eventos` | — | Lista os eventos de uma comunidade, com filtro por período e paginação. |

### Eventos

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| GET | `/api/eventos` | — | Lista eventos, com filtros por comunidade, cidade, tipo, período e paginação. |
| GET | `/api/eventos/:id` | — | Detalha um evento. |
| POST | `/api/eventos` | Bearer | Cria um evento em uma comunidade (requer ser membro ou organizador dela; data deve ser futura ou atual). |
| PUT | `/api/eventos/:id` | Bearer | Atualiza um evento (apenas organizadores da comunidade; bloqueado para eventos já ocorridos). |
| DELETE | `/api/eventos/:id` | Bearer | Exclui um evento (apenas organizadores da comunidade; bloqueado para eventos já ocorridos). |

Esta versão não inclui Swagger/OpenAPI automático. Para explorar a API manualmente, use um cliente HTTP (Insomnia, Postman, `curl`/HTTPie) com as rotas acima — veja exemplos no [README.md](README.md#acessando-o-sistema).
