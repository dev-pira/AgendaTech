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

O GitHub Actions (`deploy.yml`, SSH via `appleboy/ssh-action`) **não funciona** nesse ambiente — testado 3x, sempre falha com `dial tcp ...: i/o timeout`. O king.host bloqueia conexões SSH de entrada vindas de fora da faixa de IP autorizada, e a faixa de IPs do GitHub Actions é dinâmica/gigante (infra Azure), impossível de cadastrar de forma confiável num allowlist. Confirmado também que o próprio `crontab -e`/`crontab -l` via SSH dá "permission denied" nesse shell (mesma gaiola que já bloqueava `rsync`/`find`) — não dá pra agendar nada direto no shell.

**Solução adotada: gatilho de deploy via HTTP.** Em vez de o GitHub Actions tentar SSH (bloqueado), o workflow faz um `curl` simples numa rota do próprio Laravel (`POST /api/internal/deploy`, `App\Http\Controllers\Api\DeployController`) — o mesmo tipo de chamada HTTP que os steps de "Notify success/failure" já faziam contra a API do GitHub, nunca teve bloqueio. A rota autentica via segredo compartilhado (header `X-Deploy-Secret`, comparação `hash_equals`) e roda `deploy_agendatech.sh` via `shell_exec` — confirmado que `disable_functions` está vazio no PHP desse host (checado em 10/08/2026), então `shell_exec`/`exec` funcionam normalmente.

Configuração necessária (uma vez só):
1. Gerar um segredo: `openssl rand -hex 32`.
2. Colocar esse valor em `DEPLOY_WEBHOOK_SECRET` no `.env` do servidor.
3. Cadastrar o mesmo valor como secret `DEPLOY_WEBHOOK_SECRET` no GitHub Actions do repositório.

Deploy então acontece automaticamente a cada push em `main` — em segundos, sem custo, sem depender de nenhuma máquina externa ligada.

**Alternativas avaliadas e descartadas:**
- *CronJob pago do Kingpainel* (R$7,90/pacote de 20 tarefas) — descoberto que é baseado em URL fixa no domínio principal da conta (`www.devpira.com.br`, não dá pra apontar pro subdomínio do agendatech) e o campo "Minuto" não parece suportar intervalos tipo `*/5`, só um minuto fixo por hora. Não atende.
- *Watcher rodando numa máquina local* (poll no GitHub + SSH usando o IP já autorizado do desenvolvedor) — funcionaria, mas depende da máquina estar ligada. Descartado em favor do gatilho HTTP, que não depende de nada externo.

### Rollback

Com deploy disparado a cada push, o `main` do GitHub é a fonte da verdade. Rollback correto:

- **Não urgente:** `git revert` do commit problemático direto no `main` e dar push — o próprio push já dispara o deploy do conserto via o gatilho HTTP, automático.
- **Urgente:** rodar `bash ~/rollback_agendatech.sh` manualmente via SSH → confirmar que voltou a funcionar → depois `git revert` no `main` pra consertar a fonte da verdade também (senão o próximo push de qualquer coisa em cima do commit ruim reintroduz o bug).

## Chave SSH do GitHub Actions (histórico, hoje sem uso efetivo)

Chave dedicada `agendatech_deploy`, restrita via `command=` no `authorized_keys` — só executa `~/deploy_agendatech.sh`, sem shell interativo, sem port/agent/X11 forwarding. Cadastrada como secret `SSH_PRIVATE_KEY` no GitHub Actions. Mantida por ora mesmo com o deploy automático não funcionando, caso o bloqueio de IP do king.host mude no futuro.
