# Rotas do projeto Agenda Tech (Backend Laravel)

Este documento lista todas as rotas expostas por esta versão Laravel do backend — a mesma superfície de endpoints da [versão Django](../django/rotas.md), reimplementada com os mesmos recursos.

- **Site (sem API)** — páginas HTML server-rendered, definidas em `routes/web.php` e servidas pelos controllers `App\Http\Controllers\*`.
- **API REST** — endpoints JSON montados em `/api/`, definidos em `routes/api.php` e servidos pelos controllers `App\Http\Controllers\Api\*`.

Laravel ignora barras finais na definição de rota, então os caminhos abaixo não têm `/` no final (diferente da versão Django, que usa `/comunidades/` etc.).

---

## Site (páginas HTML)

| Método | Rota | Nome (`name=`) | Comentário |
|---|---|---|---|
| GET | `/` | `home` | Redireciona para a listagem de comunidades. |
| GET | `/cadastro` | `cadastro` | Formulário de criação de conta. |
| POST | `/cadastro` | `cadastro.store` | Cria a conta e já efetua login automático. |
| GET | `/login` | `login` | Formulário de login. |
| POST | `/login` | `login.store` | Autentica o usuário via sessão. |
| POST | `/logout` | `logout` | Encerra a sessão do usuário logado. |
| GET | `/comunidades` | `comunidades.index` | Lista pública de comunidades, com busca por nome e filtro por cidade. |
| GET | `/comunidades/nova` | `comunidades.create` | Formulário de criação de comunidade (requer login). |
| POST | `/comunidades/nova` | `comunidades.store` | Cria a comunidade (requer login); o criador vira organizador automaticamente. |
| GET | `/comunidades/{comunidade}` | `comunidades.show` | Detalhe da comunidade: membros e próximos eventos. |
| GET | `/comunidades/{comunidade}/editar` | `comunidades.edit` | Formulário de edição (requer ser organizador). |
| PUT | `/comunidades/{comunidade}/editar` | `comunidades.update` | Atualiza a comunidade (requer ser organizador). |
| GET | `/comunidades/{comunidade}/excluir` | `comunidades.confirm-delete` | Página de confirmação de exclusão. |
| DELETE | `/comunidades/{comunidade}/excluir` | `comunidades.destroy` | Exclui a comunidade (requer ser organizador; bloqueado se houver eventos futuros). |
| GET | `/eventos` | `eventos.index` | Lista pública de eventos, com filtros por comunidade, cidade, tipo e período. |
| GET | `/eventos/novo` | `eventos.create` | Formulário de criação de evento (requer ser membro de alguma comunidade). |
| POST | `/eventos/novo` | `eventos.store` | Cria o evento (requer ser membro ou organizador da comunidade escolhida). |
| GET | `/eventos/{evento}` | `eventos.show` | Detalhe do evento. |
| GET | `/eventos/{evento}/editar` | `eventos.edit` | Formulário de edição (requer ser organizador; bloqueado para eventos passados). |
| PUT | `/eventos/{evento}/editar` | `eventos.update` | Atualiza o evento (requer ser organizador; bloqueado para eventos passados). |
| GET | `/eventos/{evento}/excluir` | `eventos.confirm-delete` | Página de confirmação de exclusão. |
| DELETE | `/eventos/{evento}/excluir` | `eventos.destroy` | Exclui o evento (requer ser organizador; bloqueado para eventos passados). |

## Administração

Esta versão Laravel não inclui um painel administrativo equivalente ao Django Admin. Para inspecionar/editar dados diretamente, use `php artisan tinker` ou um cliente de banco de dados (DBeaver, TablePlus, `sqlite3`, etc.) apontando para `database/database.sqlite`.

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
| GET | `/api/comunidades/{comunidade}` | — | Detalha uma comunidade, incluindo lista de membros. |
| POST | `/api/comunidades` | Bearer | Cria uma comunidade; o usuário autenticado vira organizador automaticamente. |
| PUT | `/api/comunidades/{comunidade}` | Bearer | Atualiza campos da comunidade (apenas organizadores). |
| DELETE | `/api/comunidades/{comunidade}` | Bearer | Exclui a comunidade (apenas organizadores; bloqueado se houver eventos futuros). |
| GET | `/api/comunidades/{comunidade}/eventos` | — | Lista os eventos de uma comunidade, com filtro por período e paginação. |

### Eventos

| Método | Rota | Auth | Comentário |
|---|---|---|---|
| GET | `/api/eventos` | — | Lista eventos, com filtros por comunidade, cidade, tipo, período e paginação. |
| GET | `/api/eventos/{evento}` | — | Detalha um evento. |
| POST | `/api/eventos` | Bearer | Cria um evento em uma comunidade (requer ser membro ou organizador dela; data deve ser futura ou atual). |
| PUT | `/api/eventos/{evento}` | Bearer | Atualiza um evento (apenas organizadores da comunidade; bloqueado para eventos já ocorridos). |
| DELETE | `/api/eventos/{evento}` | Bearer | Exclui um evento (apenas organizadores da comunidade; bloqueado para eventos já ocorridos). |

Esta versão não inclui Swagger/OpenAPI automático (equivalente ao `/api/docs` do django-ninja). Para explorar a API manualmente, use um cliente HTTP (Insomnia, Postman, `curl`/HTTPie) com as rotas acima.
