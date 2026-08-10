# Stack Tecnológica — Agenda Tech

Este documento define a stack tecnológica adotada para o projeto Agenda Tech, cobrindo todas as camadas: backend, frontend, banco de dados e infraestrutura de CI/CD.

---

## Sumário

- [Backend](#backend)
- [Frontend](#frontend)
- [Banco de Dados](#banco-de-dados)
- [CI/CD e Qualidade de Código](#cicd-e-qualidade-de-código)
- [Ferramentas de Apoio](#ferramentas-de-apoio)
- [Pré-requisitos de Ambiente](#pré-requisitos-de-ambiente)
- [Setup do Ambiente Local](#setup-do-ambiente-local)

---

## Backend

| Item | Detalhe |
|------|---------|
| **Tecnologia** | PHP |
| **Versão** | 8.2 |
| **Framework** | Laravel 12.x |
| **Linguagem** | PHP 8.2 |
| **Finalidade** | Servidor de API REST para gerenciamento de comunidades, eventos e calendário compartilhado |

### Justificativa

- **PHP 8.2**: Versão estável com suporte ativo, traz melhorias de desempenho e novos recursos de tipagem (Readonly Properties, Fibers, nunca nulos em tipos de interseção). Amplamente suportado em ambientes de hospedagem compartilhada e cloud.
- **Laravel 12.x**: Framework PHP mais popular do mundo, com convenções claras que reduzem o tempo de setup. Eloquent ORM facilita o mapeamento relacional, Artisan acelera a geração de código e o ecossistema (Sanctum, Telescope, Pint) cobre as necessidades do projeto sem dependências externas. Atualizado de 11.x para 12.61.1 em 06/08 (PR #58) para corrigir 2 vulnerabilidades reais do Dependabot (CRLF injection e Signed URL Path Confusion); a versão 12.x roda no mesmo PHP 8.2, sem impacto na compatibilidade com o hosting da KingHost.

### Pré-requisitos

- PHP >= 8.2
- Composer >= 2.x
- Extensões PHP: `pdo`, `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`

---

## Frontend

| Item | Detalhe |
|------|---------|
| **Tecnologia** | React |
| **Versão** | 18.x |
| **Bundler** | Vite 5.x |
| **Linguagem** | JavaScript/JSX |
| **Finalidade** | Interface de usuário para visualização do calendário, cadastro de comunidades e registro de eventos |

### Justificativa

- **React 18**: Biblioteca de UI baseada em componentes, com enorme comunidade e ecossistema. Permite desenvolvimento modular — cada comunidade pode trabalhar em componentes isolados.
- **Vite 5.x**: Build tool moderno com Hot Module Replacement (HMR) instantâneo. Tempo de startup significativamente menor que Webpack. Configuração mínima out-of-the-box para projetos React.

### Pré-requisitos

- Node.js >= 20.11.0
- npm >= 10.x

---

## Banco de Dados

| Item | Detalhe |
|------|---------|
| **Tecnologia** | PostgreSQL |
| **Versão** | 13 |
| **Finalidade** | Armazenamento persistente de comunidades, eventos, organizadores e relacionamentos entre entidades |

### Justificativa

- **PostgreSQL 13**: Banco de dados relacional robusto e open-source. Oferece `INSERT ... ON CONFLICT DO NOTHING/UPDATE` (upsert nativo), índices BRIN e Row-Level Security, recursos utilizados pelo projeto para garantir consistência em operações concorrentes.
- Suporte sólido a tipos de dados relacionais (timestamps, enums, UUIDs via extensão `uuid-ossp`).
- Amplamente suportado por provedores de cloud (Heroku, Railway, Supabase, Render).

### Pré-requisitos

- PostgreSQL >= 13
- Cliente CLI `psql` disponível no PATH

---

## CI/CD e Qualidade de Código

| Item | Detalhe |
|------|---------|
| **Tecnologia** | GitHub Actions |
| **Finalidade** | Automação de pipelines de integração contínua (testes, linting) e deploy contínuo |

### Justificativa

- **GitHub Actions**: Integração nativa com o repositório GitHub do projeto. Zero configuração de infraestrutura externa. Workflows definidos como código (YAML) versionados no próprio repositório. Runners gratuitos para projetos open-source.

### Ferramentas de Qualidade

| Ferramenta | Versão | Finalidade |
|-----------|--------|------------|
| Laravel Pint | 1.x | Formatação automática de código PHP (baseado no PHP-CS-Fixer) — garante consistência no estilo de código |
| PHPStan | 1.x | Análise estática de código PHP — detecta erros de tipo, chamadas inválidas e inconsistências sem executar o código |

### Justificativa (Linting/Formatação)

- **Laravel Pint**: Ferramenta oficial do ecossistema Laravel para formatação de código PHP. Zero configuração necessária — usa as convenções do Laravel por padrão. Integração nativa com GitHub Actions.
- **PHPStan**: Padrão da indústria para análise estática em PHP. Detecta bugs antes de chegarem à produção. Pode ser configurado por nível (0–9) para ajustar a rigorosidade conforme a maturidade do projeto.

### Pré-requisitos

- Repositório hospedado no GitHub
- Arquivo de workflow em `.github/workflows/`

---

## Ferramentas de Apoio

| Ferramenta | Versão | Finalidade |
|-----------|--------|------------|
| Composer | >= 2.x | Gerenciador de pacotes PHP — instalação de dependências e autoload |
| npm | >= 10.x | Gerenciador de pacotes para assets do frontend (Vite, integrado ao Laravel) |
| Git | >= 2.40 | Controle de versão distribuído |
| GitHub CLI (`gh`) | >= 2.40 | Interação com GitHub via terminal — criação de issues, PRs, labels e milestones |

### Justificativa

- **Composer**: Gerenciador de dependências padrão do ecossistema PHP. Lockfile (`composer.lock`) garante reprodutibilidade de builds.
- **Git**: Padrão universal de controle de versão.
- **GitHub CLI**: Permite automação de tarefas de gestão (criação de issues, labels, milestones) via linha de comando.

---

## Pré-requisitos de Ambiente

### Tabela Resumo

| Ferramenta | Versão Mínima | Obrigatório | Comando de Verificação |
|-----------|---------------|-------------|----------------------|
| PHP | 8.2 | Sim | `php --version` |
| Composer | 2.0.0 | Sim | `composer --version` |
| Git | 2.40.0 | Sim | `git --version` |
| PostgreSQL | 13 | Sim (backend) | `psql --version` |
| Node.js | 20.11.0 | Sim (assets) | `node --version` |
| GitHub CLI | 2.40.0 | Recomendado | `gh --version` |

### Sistema Operacional

O projeto é compatível com:
- **Windows** 10/11 (com ou sem WSL)
- **macOS** 12+
- **Linux** (Ubuntu 22.04+, Fedora 38+, ou equivalente)

---

## Setup do Ambiente Local

### 1. Instalar PHP 8.2

**Windows:**
Baixar o instalador em: https://windows.php.net/download/ (selecionar PHP 8.2 Thread Safe)
Ou via Scoop: `scoop install php`

**macOS (via Homebrew):**
```bash
brew install php@8.2
brew link php@8.2
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.2 php8.2-pgsql php8.2-mbstring php8.2-xml php8.2-curl php8.2-tokenizer
```

**Verificação:**
```bash
php --version
# Esperado: PHP 8.2.x

# Verificar extensões obrigatórias
php -m | grep -E "pdo|pgsql|mbstring"
```

---

### 2. Instalar Composer

**Windows/macOS/Linux:**
```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
```

**Verificação:**
```bash
composer --version
# Esperado: Composer version 2.x.x
```
---

### 3. Instalar PostgreSQL 13

**Windows:**
Baixar o instalador em: https://www.postgresql.org/download/windows/ (selecionar versão 13)

**macOS (via Homebrew):**
```bash
brew install postgresql@13
brew services start postgresql@13
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-13 postgresql-client-13
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Verificação:**
```bash
psql --version
# Esperado: psql (PostgreSQL) 13.x

# Testar conexão local
psql -U postgres -c "SELECT version();"
```

---

### 4. Instalar Git

**Windows:**
Baixar em: https://git-scm.com/download/win

**macOS:**
```bash
# Geralmente já instalado. Caso contrário:
brew install git
```

**Linux:**
```bash
sudo apt install git
```

**Verificação:**
```bash
git --version
# Esperado: git version 2.40+
```

---

### 5. Instalar GitHub CLI (Recomendado)

**Windows:**
```bash
winget install --id GitHub.cli
```

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
sudo apt install gh
```

**Verificação:**
```bash
gh --version
# Esperado: gh version 2.40+

# Autenticar
gh auth login
```

---

### 6. Clonar o Repositório e Instalar Dependências

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/AgendaTech.git
cd AgendaTech

# Instalar dependências do backend Laravel
cd backend/laravel
composer install

# Configurar variáveis de ambiente
cp .env.example .env
php artisan key:generate

# Configurar banco de dados no .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=agendatech
# DB_USERNAME=postgres
# DB_PASSWORD=sua_senha

# Rodar migrations
php artisan migrate

# Instalar dependências do frontend (quando disponível)
cd ../../frontend
npm install
```

---

### 7. Verificação Completa do Ambiente

Execute os comandos abaixo para confirmar que tudo está configurado corretamente:

```bash
echo "=== Verificação do Ambiente Agenda Tech ==="

echo "PHP:"
php --version

echo "Composer:"
composer --version

echo "Git:"
git --version

echo "PostgreSQL:"
psql --version

echo "Node.js (assets):"
node --version

echo "GitHub CLI:"
gh --version

echo "=== Verificação concluída ==="
```

Se todos os comandos retornarem versões compatíveis com os pré-requisitos listados acima, o ambiente está pronto para desenvolvimento.

---

## Referências

- [PHP 8.2 — Documentação Oficial](https://www.php.net/releases/8.2/)
- [Laravel — Documentação](https://laravel.com/docs)
- [Laravel Pint — Documentação](https://laravel.com/docs/pint)
- [PHPStan — Documentação](https://phpstan.org/user-guide/getting-started)
- [Composer — Documentação](https://getcomposer.org/doc/)
- [React — Documentação](https://react.dev/)
- [Vite — Documentação](https://vitejs.dev/)
- [PostgreSQL 13 — Documentação](https://www.postgresql.org/docs/13/)
- [GitHub Actions — Documentação](https://docs.github.com/pt/actions)
