# Deploy — Ambiente king.host

Referência do ambiente de produção do AgendaTech, hospedado em king.host (hospedagem compartilhada/gerenciada, não é VPS com root livre). Consolida o que foi levantado na issue #63 (enabler de configuração de ambiente, não planejado na WBS original).

## PHP

O PHP-FPM que atende o site via web já vem em 8.2 (configurado pelo painel do king.host). O PHP da linha de comando (usado pelo script de deploy) precisa apontar explicitamente pro binário certo:

```
/usr/local/php/8.2/bin/php
```

### ⚠️ Pegadinha do PHPRC — leia antes de rodar PHP 8.2 manualmente

Existe uma variável de ambiente `PHPRC` global no servidor (provavelmente vinda de `/etc/profile.d/`, fora do nosso controle como cliente de hospedagem compartilhada) que força até o binário 8.2 a carregar o `php.ini` do **7.3**, quebrando o carregamento de quase todas as extensões (`mbstring`, `pdo`, `openssl` etc).

**Efeito prático:** qualquer comando PHP 8.2 rodado sem contornar isso falha silenciosamente com erros de extensão faltando, mesmo com o binário certo.

**Workaround (permanente, não é uma correção da causa raiz):** sempre exportar `PHPRC` explicitamente antes de qualquer chamada ao PHP 8.2:

```bash
export PHPRC=/etc/opt/remi/php82/php.ini
```

Isso já está embutido no `deploy_agendatech.sh` e no `rollback_agendatech.sh` (rodam na própria máquina, não versionados no repo). **Se criar um script novo, cron novo, ou rodar PHP 8.2 manualmente via SSH, lembre de exportar essa variável antes** — do contrário vai reproduzir o mesmo bug.

Não investigamos mais a fundo a causa raiz porque, em hospedagem compartilhada gerenciada, `/etc/profile.d/` normalmente não é editável pelo cliente — não haveria como "corrigir" de verdade, só documentar o contorno. Decisão: aceito como limitação conhecida do ambiente, workaround estável.

## Composer

Instalado manualmente em `~/composer.phar` via bootstrap oficial ([getcomposer.org/installer](https://getcomposer.org/installer)). Não vem pré-instalado no ambiente.

## Banco de dados

PostgreSQL 13 (a versão mais recente disponível no king.host entre as opções 9.5/11/13 — ver `docs/stack.md`).

```
DB_CONNECTION=pgsql
DB_HOST=pgsql50-farm1.kinghost.net
DB_PORT=5432
DB_DATABASE=devpira
DB_USERNAME=devpira
```

Senha só existe no `.env` do servidor, nunca versionada. Driver `pdo_pgsql` confirmado habilitado no PHP 8.2 do servidor — validado empiricamente em 10/08/2026 rodando o fluxo completo de CRUD (criar/editar/excluir comunidade e evento) contra o banco real via sessão autenticada.

## Estrutura no servidor

- Clone privado do repo em `~/apps/agendatech`, **fora do webroot** — protege `.env`/`vendor`/código-fonte de acesso via URL.
- Só o conteúdo de `backend/laravel/public/` é publicado em `~/www/agendatech` (webroot real).
- `index.php` tem os caminhos de `vendor`/`bootstrap`/`maintenance` reescritos via `sed` a cada deploy, apontando pro clone privado.

## Deploy automático

O GitHub Actions (`deploy.yml`, SSH via `appleboy/ssh-action`) **não funciona** nesse ambiente — testado 3x, sempre falha com `dial tcp ...: i/o timeout`. O king.host bloqueia conexões SSH de entrada vindas de fora da faixa de IP autorizada, e a faixa de IPs do GitHub Actions é dinâmica/gigante (infra Azure), impossível de cadastrar de forma confiável num allowlist.

**Solução adotada:** deploy pull-based via CronJob do Kingpainel, rodando `deploy_agendatech.sh` periodicamente (idealmente a cada 1-5 min, conforme o menor intervalo que o painel permitir). O script faz curto-circuito quando não há commit novo (compara `HEAD` local com `origin/main` antes de rodar composer/migrate/cache), então rodar com frequência alta é seguro e leve.

### Rollback

Com deploy pull-based, o `main` do GitHub é a fonte da verdade — o cron sempre convergir pra ele. Rollback correto:

- **Não urgente:** `git revert` do commit problemático direto no `main`. O próximo ciclo do cron entrega o conserto sozinho.
- **Urgente (não pode esperar o próximo ciclo):** pausar o CronJob no Kingpainel → rodar `bash ~/rollback_agendatech.sh` manualmente via SSH → confirmar que voltou a funcionar → `git revert` no `main` pra consertar de verdade → reativar o CronJob.

## Chave SSH do GitHub Actions (histórico, hoje sem uso efetivo)

Chave dedicada `agendatech_deploy`, restrita via `command=` no `authorized_keys` — só executa `~/deploy_agendatech.sh`, sem shell interativo, sem port/agent/X11 forwarding. Cadastrada como secret `SSH_PRIVATE_KEY` no GitHub Actions. Mantida por ora mesmo com o deploy automático não funcionando, caso o bloqueio de IP do king.host mude no futuro.
