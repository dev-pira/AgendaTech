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

### Frontend — resolvido (FTP)

O GitHub Actions faz build do frontend (Vite) e sobe o resultado via FTP direto pro king.host (`deploy-frontend.yml`) — ver issues #85/#86.

**Por que FTP e não SSH:** SSH direto do GitHub Actions **nunca funcionou** nesse ambiente — testado múltiplas vezes (inclusive com host/usuário/senha corrigidos em 12/08/2026), sempre falha com timeout de conexão em nível de rede (nem chega a tentar autenticar). O king.host restringe SSH por geografia (só aceitava IP do Brasil por padrão; GitHub Actions roda fora). Em 12/08/2026 confirmamos que **FTP tem a mesma restrição, mas com um toggle simples pra resolver**: Kingpainel → gerenciar FTP → liberar acesso Global (não só Brasil). Com isso ligado, FTP do GitHub Actions passou a funcionar - SSH continua bloqueado independente disso (são mecanismos de bloqueio separados, aparentemente).

O workflow builda com `base: '/app/'` (ver `frontend/vite.config.ts`) e sobe `frontend/dist/` via `SamKirkland/FTP-Deploy-Action` pra `~/www/agendatech/app/` — subpasta da mesma webroot do backend, mesma origem (sem CORS/mixed content). Reusa os secrets `SSH_HOST`/`SSH_USER`/`SSH_PASSWORD` (mesma conta, FTP e SSH compartilham login no king.host).

### Backend — ainda em aberto

**Tentativa 1 (descartada): SSH via GitHub Actions.** Testado 3x, sempre `dial tcp ...: i/o timeout` — mesmo bloqueio geográfico do parágrafo acima.

**Tentativa 2 (descartada): gatilho HTTP + shell_exec.** PR #80 implementou uma rota (`POST /api/internal/deploy`) que rodava `deploy_agendatech.sh` via `shell_exec` no PHP. Funcionava a autenticação (segredo compartilhado, header `X-Deploy-Secret`), mas o `shell_exec` em si **falha sempre** — confirmado em 11/08/2026 que o PHP-FPM (web) desse host tem `shell_exec`/`exec`/`proc_open`/etc desabilitados via `disable_functions` (preset de segurança do host contra webshells; a checagem anterior via CLI, que dava vazio, testou o PHP errado - CLI e FPM têm php.ini diferentes). Não tem como contornar isso sem acesso ao php.ini do host, que não temos em hospedagem compartilhada.

**Em avaliação agora:**
- *Publicação via Git nativa do Kingpainel* — feature própria do painel que cadastra um webhook do GitHub e faz `git pull` sozinho a cada push, sem depender de SSH/FTP/shell_exec (roda do lado do host, fora da nossa sandbox de PHP). Promissora, ainda não configurada de ponta a ponta - ver #31.
- *Ponte via VM Oracle Cloud (Always Free)* — máquina com IP fixo, autorizada separadamente, que receberia aviso do GitHub Actions e disparia o SSH de verdade (ela tem shell completo, ao contrário do PHP-FPM). Só faz sentido se o Git nativo não for suficiente (ex.: se precisarmos rodar `composer install`/`migrate` como parte do deploy).

**Alternativas avaliadas e descartadas:**
- *CronJob pago do Kingpainel* (R$7,90/pacote de 20 tarefas) — descoberto que é baseado em URL fixa no domínio principal da conta (`www.devpira.com.br`, não dá pra apontar pro subdomínio do agendatech) e o campo "Minuto" não parece suportar intervalos tipo `*/5`, só um minuto fixo por hora. Não atende.
- *Watcher rodando numa máquina local* (poll no GitHub + SSH usando o IP já autorizado do desenvolvedor) — funcionaria, mas depende da máquina estar ligada. Descartado.

### Rollback

Com deploy disparado a cada push, o `main` do GitHub é a fonte da verdade. Rollback correto:

- **Não urgente:** `git revert` do commit problemático direto no `main` e dar push — o próprio push já dispara o deploy do conserto via o gatilho HTTP, automático.
- **Urgente:** rodar `bash ~/rollback_agendatech.sh` manualmente via SSH → confirmar que voltou a funcionar → depois `git revert` no `main` pra consertar a fonte da verdade também (senão o próximo push de qualquer coisa em cima do commit ruim reintroduz o bug).

## Chave SSH do GitHub Actions (histórico, hoje sem uso efetivo)

Chave dedicada `agendatech_deploy`, restrita via `command=` no `authorized_keys` — só executa `~/deploy_agendatech.sh`, sem shell interativo, sem port/agent/X11 forwarding. Cadastrada como secret `SSH_PRIVATE_KEY` no GitHub Actions. Mantida por ora mesmo com o deploy automático não funcionando, caso o bloqueio de IP do king.host mude no futuro.
