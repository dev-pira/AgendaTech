# Test Plan — Backend Agenda Tech

> Matriz de cobertura dos testes automatizados do backend (`backend/laravel/tests`). Criado a pedido do Fábio em 06/08, cobrindo os 105 testes existentes na época — mantenha atualizado a cada PR que adicionar ou remover testes.
>
> **Fonte da verdade continua sendo o código dos testes.** Este documento é um índice de navegação e uma checklist de cobertura por regra de negócio — se divergir do que o teste realmente faz, o teste está certo e este arquivo desatualizado.

## Como ler esta matriz

- **Camada**: `Unit` (model, sem HTTP), `API` (endpoints `/api/*`, JSON), `Web` (rotas server-rendered, sessão/formulário).
- **Regra**: código RN- de `docs/escopo-funcional.md` quando a regra é uma regra de negócio nomeada; texto livre quando é comportamento genérico (paginação, formato de resposta etc.).
- **Teste**: `Arquivo::método` — caminho relativo a `backend/laravel/tests`.

---

## 1. Autenticação

| Regra | Cenário | Camada | Teste |
|---|---|---|---|
| Login válido retorna token | credenciais corretas → 200 + JWT | API | `Feature/Api/AuthTokenTest::test_credenciais_validas_retorna_200_com_token` |
| Token emitido é válido | token retornado autentica de verdade numa rota protegida (ciclo completo emissão → verificação) | API | `Feature/Api/AuthTokenTest::test_token_retornado_e_valido_para_o_usuario_correto` |
| Credenciais inválidas | senha errada → 401 | API | `Feature/Api/AuthTokenTest::test_senha_invalida_retorna_401` |
| Token expirado | JWT com `exp` no passado → 401 | API | `Feature/Api/AuthTokenTest::test_token_expirado_retorna_401` |
| Token com assinatura inválida | JWT assinado com outra chave → 401 | API | `Feature/Api/AuthTokenTest::test_token_com_assinatura_invalida_retorna_401` |
| Token malformado | string qualquer como Bearer → 401 (nunca 500) | API | `Feature/Api/AuthTokenTest::test_token_malformado_retorna_401` |
| Token de usuário removido | JWT válido, mas usuário foi deletado depois de emitido → 401 | API | `Feature/Api/AuthTokenTest::test_token_de_usuario_que_nao_existe_mais_retorna_401` |
| Cadastro (form) | GET retorna 200 | Web | `Feature/Web/AuthTest::test_cadastro_get_retorna_200` |
| Cadastro válido | POST válido cria usuário e loga | Web | `Feature/Web/AuthTest::test_cadastro_post_valido_cria_usuario_e_loga` |
| Cadastro — senhas diferentes | confirmação não bate → não cria usuário | Web | `Feature/Web/AuthTest::test_cadastro_senhas_diferentes_nao_cria_usuario` |
| Cadastro — já autenticado | usuário logado acessando `/cadastro` → redirect | Web | `Feature/Web/AuthTest::test_cadastro_usuario_ja_autenticado_e_redirecionado` |
| Login (form) | GET retorna 200 | Web | `Feature/Web/AuthTest::test_login_get_retorna_200` |
| Login válido | credenciais corretas autenticam | Web | `Feature/Web/AuthTest::test_login_credenciais_validas_autentica` |
| Login inválido | credenciais erradas não autenticam | Web | `Feature/Web/AuthTest::test_login_credenciais_invalidas_nao_autentica` |
| Logout | desautentica a sessão | Web | `Feature/Web/AuthTest::test_logout_desautentica_usuario` |

**Cobertura:** 15 testes. Gap de expiração/assinatura/token-de-usuário-removido fechado (issue #52 — migração de Bearer token opaco pra JWT). Revogação continua não coberta porque JWT stateless não suporta revogação nativa (é o trade-off do design); se isso virar requisito, provavelmente entra uma denylist e um teste novo aqui.

---

## 2. Comunidades — regras de negócio (model)

| Regra | Descrição | Teste |
|---|---|---|
| — | Factory cria registro válido | `Unit/Models/ComunidadeTest::test_created` |
| RN-COM-08 | Criador é automaticamente adicionado como organizador | `Unit/Models/ComunidadeTest::test_criador_e_adicionado_como_organizador` |
| RN-COM-02 | `nome` fora de 3–100 chars levanta `ValidationException` | `Unit/Models/ComunidadeTest::test_nome_muito_curto_levanta_validation_error` |
| RN-COM-03 | `descricao` com menos de 10 chars levanta erro | `Unit/Models/ComunidadeTest::test_descricao_muito_curta_levanta_validation_error` |
| RN-COM-04 | `contato` que não é e-mail nem URL levanta erro | `Unit/Models/ComunidadeTest::test_contato_invalido_levanta_validation_error` |
| RN-COM-05 | `logo_url` sem extensão de imagem válida levanta erro | `Unit/Models/ComunidadeTest::test_logo_url_sem_extensao_de_imagem_levanta_validation_error` |
| RN-COM-05 | `logo_url` válida é aceita | `Unit/Models/ComunidadeTest::test_logo_url_valida_e_aceita` |
| RN-COM-06 | Nome duplicado (case-insensitive) levanta erro | `Unit/Models/ComunidadeTest::test_nome_duplicado_case_insensitive_levanta_erro` |
| — | Listagem padrão ordenada por nome | `Unit/Models/ComunidadeTest::test_ordering_por_nome` |

**Cobertura:** 9/9 regras RN-COM-01 a RN-COM-09 com teste direto, exceto:
- RN-COM-01 (campos obrigatórios) — coberta indiretamente via `FormRequest` (ver §4), não no model.
- RN-COM-09 (não excluir com evento futuro) e RN-COM-07 (só organizador edita/exclui) — cobertas na camada API/Web (§3), não no model, porque são checagens de autorização no controller.
- RN-COM-10 (listagem pública não expõe dado sensível) — **sem teste dedicado.** `ComunidadeResource` não expõe e-mail de membros, mas isso não é verificado explicitamente em nenhum teste. Gap a fechar.

---

## 3. Comunidades — API (`/api/comunidades`)

| Endpoint / cenário | Status esperado | Teste |
|---|---|---|
| `GET` lista, envelope de paginação | 200 | `Feature/Api/ComunidadeTest::test_listar_retorna_200_com_envelope_de_paginacao` |
| `GET` lista, filtro `?cidade=` | 200, filtrado | `Feature/Api/ComunidadeTest::test_listar_filtra_por_cidade` |
| `GET` lista, `pagina` negativa | 400 | `Feature/Api/ComunidadeTest::test_listar_pagina_negativa_retorna_400` |
| `GET` lista, `total_membros` no payload | 200 | `Feature/Api/ComunidadeTest::test_listar_total_membros_incluido_na_resposta` |
| `GET /{id}` com dados completos | 200 | `Feature/Api/ComunidadeTest::test_obter_retorna_200_com_dados_completos` |
| `GET /{id}` inexistente | 404 | `Feature/Api/ComunidadeTest::test_obter_id_inexistente_retorna_404` |
| `POST` sem autenticação | 401 | `Feature/Api/ComunidadeTest::test_criar_sem_autenticacao_retorna_401` |
| `POST` válido | 201, persiste | `Feature/Api/ComunidadeTest::test_criar_com_sucesso_e_retorna_201` |
| `POST` — RN-COM-08 | criador vira organizador | `Feature/Api/ComunidadeTest::test_criador_vira_organizador_automaticamente` |
| `POST` — RN-COM-01 | `nome` ausente | 400 ou 422 | `Feature/Api/ComunidadeTest::test_criar_nome_ausente_retorna_400_ou_422` |
| `POST` — comprimento (2.4) | `descricao` > 1000 chars → 422 | `Feature/Api/ComunidadeTest::test_criar_descricao_acima_de_1000_caracteres_retorna_422` |
| `POST` — RN-COM-06 | nome duplicado → 409 | `Feature/Api/ComunidadeTest::test_criar_nome_duplicado_retorna_409` |
| `PUT` — RN-COM-07 | organizador atualiza com sucesso | `Feature/Api/ComunidadeTest::test_atualizar_organizador_com_sucesso` |
| `PUT` — RN-COM-07 | não-organizador → 403 | `Feature/Api/ComunidadeTest::test_atualizar_membro_sem_ser_organizador_recebe_403` |
| `PUT` inexistente | 404 | `Feature/Api/ComunidadeTest::test_atualizar_comunidade_inexistente_retorna_404` |
| `DELETE` — RN-COM-07 | organizador exclui com sucesso | `Feature/Api/ComunidadeTest::test_excluir_organizador_exclui_com_sucesso` |
| `DELETE` — RN-COM-09 | evento futuro agendado → 400, não exclui | `Feature/Api/ComunidadeTest::test_excluir_com_evento_futuro_retorna_400` |
| `DELETE` — RN-COM-07 | não-organizador → 403 | `Feature/Api/ComunidadeTest::test_excluir_nao_organizador_recebe_403` |
| `GET /{id}/eventos`, envelope de paginação | 200 | `Feature/Api/ComunidadeTest::test_eventos_da_comunidade_retorna_200_com_envelope_de_paginacao` |

**Cobertura:** 19 testes. Todos os 5 verbos HTTP (`GET` lista, `GET` item, `POST`, `PUT`, `DELETE`) e todas as regras RN-COM-01, 06, 07, 08, 09 cobertas.

O teste de `GET /{id}/eventos` é regressão: `PaginaResultados::paginar()` era tipado com a classe concreta `Builder`, mas relações Eloquent (`$comunidade->eventos()->with(...)`) devolvem a própria relação (`HasMany`), não um `Builder` — `TypeError` em runtime. Esse endpoint nunca teve teste até a issue #53 mexer em código vizinho e pegar o bug de rodada.

---

## 4. Comunidades — Web (`/comunidades`)

Mesmo conjunto de regras de negócio que a API (§3), mas testando o fluxo server-rendered: sessão, redirect, flash de erro no formulário em vez de JSON. 19 testes em `Feature/Web/ComunidadeTest.php`:

- Listagem: retorno 200, filtro por busca, filtro por cidade, mensagem de lista vazia
- Detalhe: 200 com dados, 404 para id inexistente, visibilidade condicional dos botões de gestão (organizador vê, visitante não)
- Criar: anônimo redireciona pro login, GET autenticado 200, POST válido redireciona pro detalhe, criador vira organizador, nome duplicado reexibe formulário com erro (equivalente web do 409 da API)
- Atualizar: organizador com sucesso, não-organizador redirecionado com erro
- Excluir: página de confirmação, exclusão com sucesso, bloqueio com evento futuro, não-organizador redirecionado

**Por que duplicar API e Web?** As duas superfícies compartilham a validação (`FormRequest`/model), mas o *transporte* da regra é diferente (JSON+status code vs. redirect+flash). Um teste não substitui o outro.

---

## 5. Eventos — regras de negócio (model)

| Regra | Descrição | Teste |
|---|---|---|
| — | Factory cria registro válido | `Unit/Models/EventoTest::test_created` |
| — | `titulo` fora de 5–200 chars levanta erro | `Unit/Models/EventoTest::test_titulo_muito_curto_levanta_validation_error` |
| — | `descricao` com menos de 20 chars levanta erro | `Unit/Models/EventoTest::test_descricao_muito_curta_levanta_validation_error` |
| — | `hora_fim` ≤ `hora_inicio` levanta erro | `Unit/Models/EventoTest::test_hora_fim_antes_de_hora_inicio_levanta_validation_error` |
| — | `hora_fim` > `hora_inicio` é aceito | `Unit/Models/EventoTest::test_hora_fim_apos_hora_inicio_e_aceito` |
| — | `tipo=online`/`hibrido` sem `url_online` levanta erro | `Unit/Models/EventoTest::test_tipo_online_sem_url_levanta_validation_error` |
| — | `tipo=online` com `url_online` é aceito | `Unit/Models/EventoTest::test_tipo_online_com_url_e_aceito` |
| RN-EVT-09 | título+data duplicados na mesma comunidade levanta erro | `Unit/Models/EventoTest::test_evento_duplicado_mesma_comunidade_titulo_data_levanta_erro` |
| — | Listagem padrão ordenada por data e hora | `Unit/Models/EventoTest::test_ordering_por_data_e_hora` |

**Gap conhecido:** RN-EVT-04 (data não pode ser passada) e RN-EVT-10 (não editar/excluir evento já ocorrido) não são regra de *model* — são checadas no controller (`Carbon::parse(...)->lt(now())`), cobertas em §6/§7, não aqui.

---

## 6. Eventos — API (`/api/eventos`)

| Endpoint / cenário | Status esperado | Teste |
|---|---|---|
| `GET` lista, envelope de paginação | 200 | `Feature/Api/EventoTest::test_listar_retorna_200_com_envelope_de_paginacao` |
| `GET` lista, filtro `?comunidade_id=` | 200, filtrado | `Feature/Api/EventoTest::test_listar_filtra_por_comunidade` |
| `GET` lista, resource aninhado | `comunidade`/`organizador` no payload | `Feature/Api/EventoTest::test_listar_resposta_inclui_comunidade_e_organizador_aninhados` |
| `GET /{id}` | 200 | `Feature/Api/EventoTest::test_obter_retorna_200` |
| `GET /{id}` inexistente | 404 | `Feature/Api/EventoTest::test_obter_id_inexistente_retorna_404` |
| `POST` sem autenticação | 401 | `Feature/Api/EventoTest::test_criar_sem_autenticacao_retorna_401` |
| `POST` — RN-EVT-07 | membro/organizador cria com sucesso | `Feature/Api/EventoTest::test_criar_membro_cria_com_sucesso` |
| `POST` — RN-EVT-07 | não-membro da comunidade → 403 | `Feature/Api/EventoTest::test_criar_nao_membro_recebe_403` |
| `POST` — RN-EVT-04 | data passada → 400 | `Feature/Api/EventoTest::test_criar_data_passada_retorna_400` |
| `POST` — RN-EVT-09 | título+data duplicados → 409 | `Feature/Api/EventoTest::test_criar_evento_duplicado_retorna_409` |
| `POST` — validação | `tipo=online` sem `url_online` → 400 | `Feature/Api/EventoTest::test_criar_tipo_online_sem_url_retorna_400` |
| `PUT` — organizador | atualiza com sucesso | `Feature/Api/EventoTest::test_atualizar_organizador_com_sucesso` |
| `PUT` — não-organizador | 403 | `Feature/Api/EventoTest::test_atualizar_membro_sem_ser_organizador_recebe_403` |
| `PUT` — RN-EVT-10 | evento já ocorrido → 400, não edita | `Feature/Api/EventoTest::test_atualizar_evento_passado_nao_pode_ser_editado` |
| `DELETE` — organizador | exclui com sucesso | `Feature/Api/EventoTest::test_excluir_organizador_exclui_com_sucesso` |
| `DELETE` — RN-EVT-10 | evento já ocorrido → 400, não exclui | `Feature/Api/EventoTest::test_excluir_evento_passado_nao_pode_ser_excluido` |
| `DELETE` — não-organizador | 403 | `Feature/Api/EventoTest::test_excluir_nao_organizador_recebe_403` |

**Cobertura:** 17 testes. **Gap conhecido:** filtros `?data_inicio=`/`?data_fim=`/`?tipo=` (implementados em `EventoController::index`, ver `docs/api.md`) não têm teste dedicado — só o filtro `comunidade_id` é testado. Vale adicionar.

---

## 7. Eventos — Web (`/eventos`)

Mesmo padrão de duplicação API/Web do §4, 17 testes em `Feature/Web/EventoTest.php`: listagem (com filtro por comunidade e mensagem de vazio), detalhe (200/404, botões ocultos para evento passado), criar (anônimo, usuário sem comunidade, sucesso, data passada), atualizar (organizador, não-organizador, evento passado), excluir (confirmação, sucesso, evento passado, não-organizador).

---

## 8. Envelope de erro padronizado (tarefa 2.4)

Cobertura específica do contrato `{"error": {"code", "message", "fields"?}}` (`App\Support\ApiErrorResponder`), independente do endpoint que gerou o erro:

| Cenário | `code` esperado | Teste |
|---|---|---|
| Recurso inexistente (`404`) | `NOT_FOUND`, mensagem genérica (não vaza FQCN do model) | `Feature/Api/ErrorEnvelopeTest::test_recurso_inexistente_retorna_envelope_not_found` |
| Sem autenticação (`401`) | `UNAUTHENTICATED` | `Feature/Api/ErrorEnvelopeTest::test_requisicao_sem_autenticacao_retorna_envelope_unauthenticated` |
| Validação (`422`) | `VALIDATION_ERROR` + `fields` por campo | `Feature/Api/ErrorEnvelopeTest::test_campo_obrigatorio_ausente_retorna_envelope_validation_error_com_fields` |
| Conflito (`409`) | `CONFLICT` | `Feature/Api/ErrorEnvelopeTest::test_nome_duplicado_retorna_envelope_conflict` |
| Sem permissão (`403`) | `FORBIDDEN` | `Feature/Api/ErrorEnvelopeTest::test_acao_sem_permissao_retorna_envelope_forbidden` |

**Gap conhecido:** não há teste automatizado para o código `500 INTERNAL_ERROR` (mensagem genérica, sem vazar detalhe) — validado manualmente via `docs/api.md`, não em CI. Difícil de testar sem forçar uma exception artificial; considerar um endpoint de teste dedicado só em ambiente `testing` se isso virar prioridade.

---

## 9. Membros (`/api/comunidades/{id}/membros`)

Gestão de membros/organizadores — issue #53, porte de `backend/src/services/membros.service.js` (Node) que nunca tinha sido migrado pro Laravel. **Todos os 4 endpoints exigem autenticação, inclusive o `GET`** (diferente de Comunidades/Eventos).

| Endpoint / cenário | Status esperado | Teste |
|---|---|---|
| `GET` lista membros da comunidade | 200 | `Feature/Api/MembroTest::test_listar_retorna_200_com_membros_da_comunidade` |
| `GET` filtra por `?papel=` | 200, filtrado | `Feature/Api/MembroTest::test_listar_filtra_por_papel` |
| `GET` sem autenticação | 401 | `Feature/Api/MembroTest::test_listar_sem_autenticacao_retorna_401` |
| `GET` comunidade inexistente | 404 | `Feature/Api/MembroTest::test_listar_comunidade_inexistente_retorna_404` |
| `POST` organizador adiciona com sucesso | 201 | `Feature/Api/MembroTest::test_adicionar_organizador_adiciona_com_sucesso` |
| `POST` sem ser organizador | 403 | `Feature/Api/MembroTest::test_adicionar_sem_ser_organizador_recebe_403` |
| `POST` — RN-ORG-04 | email sem usuário correspondente → 404 | `Feature/Api/MembroTest::test_adicionar_email_sem_usuario_correspondente_retorna_404` |
| `POST` usuário já é membro | 409 | `Feature/Api/MembroTest::test_adicionar_usuario_ja_membro_retorna_409` |
| `POST` sem autenticação | 401 | `Feature/Api/MembroTest::test_adicionar_sem_autenticacao_retorna_401` |
| `PATCH` papel — organizador promove com sucesso | 200 | `Feature/Api/MembroTest::test_atualizar_papel_organizador_promove_membro_com_sucesso` |
| `PATCH` papel sem ser organizador | 403 | `Feature/Api/MembroTest::test_atualizar_papel_sem_ser_organizador_recebe_403` |
| `PATCH` papel — RN-ORG-01 | rebaixar último organizador → 422 | `Feature/Api/MembroTest::test_atualizar_papel_rebaixar_ultimo_organizador_retorna_422` |
| `PATCH` papel, membro não encontrado | 404 | `Feature/Api/MembroTest::test_atualizar_papel_membro_nao_encontrado_retorna_404` |
| `DELETE` organizador remove com sucesso | 204 | `Feature/Api/MembroTest::test_remover_organizador_remove_membro_com_sucesso` |
| `DELETE` sem ser organizador | 403 | `Feature/Api/MembroTest::test_remover_sem_ser_organizador_recebe_403` |
| `DELETE` — RN-ORG-01 | remover último organizador → 422 | `Feature/Api/MembroTest::test_remover_ultimo_organizador_retorna_422` |
| `DELETE`, membro não encontrado | 404 | `Feature/Api/MembroTest::test_remover_membro_nao_encontrado_retorna_404` |

**Cobertura:** 17 testes. RN-ORG-01 (nunca zero organizadores) e RN-ORG-04 (email precisa existir) cobertas nos dois endpoints que se aplicam (promover/rebaixar e adicionar).

---

## 10. Calendário (`/api/calendario`)

Endpoint agregador pra tela de calendário compartilhado (DevItape) — issue #54, porte de `backend/src/controllers/calendario.controller.js` (Node). Público, sem paginação, `data_inicio`/`data_fim` obrigatórios (diferente de `GET /eventos`, onde são opcionais).

| Cenário | Status esperado | Teste |
|---|---|---|
| Sem `data_inicio` | 422 | `Feature/Api/CalendarioTest::test_sem_data_inicio_retorna_422` |
| Sem `data_fim` | 422 | `Feature/Api/CalendarioTest::test_sem_data_fim_retorna_422` |
| `data_fim` antes de `data_inicio` | 422 | `Feature/Api/CalendarioTest::test_data_fim_antes_de_data_inicio_retorna_422` |
| Retorna 200 com envelope `eventos`/`total`/`periodo` | 200 | `Feature/Api/CalendarioTest::test_retorna_200_com_envelope_eventos_total_periodo` |
| Não retorna eventos fora do período | 200, filtrado | `Feature/Api/CalendarioTest::test_nao_retorna_eventos_fora_do_periodo` |
| Filtra por `comunidade_id` | 200, filtrado | `Feature/Api/CalendarioTest::test_filtra_por_comunidade_id` |
| Filtra por `cidade` | 200, filtrado | `Feature/Api/CalendarioTest::test_filtra_por_cidade` |
| Filtra por `tipo` | 200, filtrado | `Feature/Api/CalendarioTest::test_filtra_por_tipo` |
| Endpoint é público | 200 sem token | `Feature/Api/CalendarioTest::test_endpoint_e_publico_sem_autenticacao` |

**Cobertura:** 9 testes.

---

## Resumo por camada

| Camada | Testes | Arquivos |
|---|---:|---|
| Unit (models) | 18 | `Unit/Models/ComunidadeTest.php`, `Unit/Models/EventoTest.php` |
| API (Feature) | 74 | `Feature/Api/AuthTokenTest.php`, `ComunidadeTest.php`, `ErrorEnvelopeTest.php`, `EventoTest.php`, `MembroTest.php`, `CalendarioTest.php` |
| Web (Feature) | 44 | `Feature/Web/AuthTest.php`, `ComunidadeTest.php`, `EventoTest.php` |
| **Total** | **136** | — |

Rodar tudo: `php artisan test` (dentro de `backend/laravel`). Rodar um arquivo: `php artisan test --filter=NomeDaClasse`.

## Gaps conhecidos (backlog, não bloqueiam PRs atuais)

1. RN-COM-10 (listagem não expõe dado sensível de membro) sem teste dedicado.
2. Filtros `data_inicio`/`data_fim`/`tipo` de `GET /api/eventos` sem teste (só `comunidade_id` testado).
3. Erro `500 INTERNAL_ERROR` do envelope não tem teste automatizado.
4. ~~Sem teste de expiração/revogação de token~~ — fechado na issue #52 (migração pra JWT). Revogação continua não coberta (trade-off do design stateless, não uma lacuna de teste).
5. Mensagens de erro de validação sem `messages()` customizado saem em inglês (`"The data inicio field is required."`), mesmo com `APP_LOCALE=pt_BR` — falta `lang/pt_BR/validation.php`. Afeta todos os `FormRequest` da API. Encontrado testando `CalendarioRequest` (issue #54), não corrigido ainda — nenhum teste falha por causa disso porque nenhum teste verifica o idioma da mensagem, só o status code.

Ao fechar um desses, mova a linha correspondente da tabela de gap para a seção principal e apague daqui.
