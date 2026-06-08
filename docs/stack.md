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
| **Tecnologia** | Node.js |
| **Versão** | 20 LTS (≥ 20.11.0) |
| **Framework** | Express.js 4.x |
| **Linguagem** | JavaScript (com possibilidade de migração para TypeScript) |
| **Finalidade** | Servidor de API REST para gerenciamento de comunidades, eventos e calendário compartilhado |

### Justificativa

- **Node.js 20 LTS**: Versão com suporte de longo prazo, estável para produção. Ecossistema JavaScript permite que todas as comunidades contribuam com uma única linguagem no frontend e backend.
- **Express.js 4.x**: Framework minimalista, amplamente conhecido e documentado. Curva de aprendizado baixa, ideal para um projeto construído ao vivo por múltiplas comunidades. Grande quantidade de middlewares disponíveis para autenticação, validação e logging.

### Pré-requisitos

- Node.js >= 20.11.0
- npm >= 10.x (incluso com Node.js 20)

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
| **Versão** | 16.x |
| **Finalidade** | Armazenamento persistente de comunidades, eventos, organizadores e relacionamentos entre entidades |

### Justificativa

- **PostgreSQL 16**: Banco de dados relacional robusto, open-source e gratuito. Excelente suporte a tipos de dados complexos (JSON, arrays, timestamps com timezone). Ideal para modelagem de dados com relacionamentos (comunidades ↔ eventos ↔ organizadores).
- Possui ferramentas maduras de migração, backup e monitoramento.
- Amplamente suportado por provedores de cloud (Heroku, Railway, Supabase, Render).

### Pré-requisitos

- PostgreSQL >= 16.0
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
| ESLint | 8.x | Análise estática de código JavaScript/JSX — identifica bugs, padrões ruins e inconsistências |
| Prettier | 3.x | Formatação automática de código — garante consistência visual em todo o projeto |

### Justificativa (Linting/Formatação)

- **ESLint + Prettier**: Padrão da indústria para projetos JavaScript/TypeScript. Integração nativa com editores de código (VS Code, WebStorm). Permite configuração compartilhada entre todas as comunidades para manter consistência.

### Pré-requisitos

- Repositório hospedado no GitHub
- Arquivo de workflow em `.github/workflows/`

---

## Ferramentas de Apoio

| Ferramenta | Versão | Finalidade |
|-----------|--------|------------|
| npm | >= 10.x | Gerenciador de pacotes — instalação de dependências, scripts de build e execução |
| Git | >= 2.40 | Controle de versão distribuído |
| GitHub CLI (`gh`) | >= 2.40 | Interação com GitHub via terminal — criação de issues, PRs, labels e milestones |

### Justificativa

- **npm**: Vem instalado com o Node.js, eliminando necessidade de setup adicional. Lockfile (`package-lock.json`) garante reprodutibilidade de builds.
- **Git**: Padrão universal de controle de versão.
- **GitHub CLI**: Permite automação de tarefas de gestão (criação de issues, labels, milestones) via linha de comando.

---

## Pré-requisitos de Ambiente

### Tabela Resumo

| Ferramenta | Versão Mínima | Obrigatório | Comando de Verificação |
|-----------|---------------|-------------|----------------------|
| Node.js | 20.11.0 | Sim | `node --version` |
| npm | 10.0.0 | Sim | `npm --version` |
| Git | 2.40.0 | Sim | `git --version` |
| PostgreSQL | 16.0 | Sim (backend) | `psql --version` |
| GitHub CLI | 2.40.0 | Recomendado | `gh --version` |

### Sistema Operacional

O projeto é compatível com:
- **Windows** 10/11 (com ou sem WSL)
- **macOS** 12+
- **Linux** (Ubuntu 22.04+, Fedora 38+, ou equivalente)

---

## Setup do Ambiente Local

### 1. Instalar Node.js 20 LTS

**Windows/macOS:**
Baixar o instalador em: https://nodejs.org/en/download (selecionar versão 20 LTS)

**Linux (via nvm — recomendado):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

**Verificação:**
```bash
node --version
# Esperado: v20.x.x

npm --version
# Esperado: 10.x.x
```

---

### 2. Instalar PostgreSQL 16

**Windows:**
Baixar o instalador em: https://www.postgresql.org/download/windows/

**macOS (via Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-client-16
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Verificação:**
```bash
psql --version
# Esperado: psql (PostgreSQL) 16.x

# Testar conexão local
psql -U postgres -c "SELECT version();"
```

---

### 3. Instalar Git

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

### 4. Instalar GitHub CLI (Recomendado)

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

### 5. Clonar o Repositório e Instalar Dependências

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/AgendaTech.git
cd AgendaTech

# Instalar dependências do backend (quando disponível)
cd backend
npm install

# Instalar dependências do frontend (quando disponível)
cd ../frontend
npm install
```

---

### 6. Verificação Completa do Ambiente

Execute os comandos abaixo para confirmar que tudo está configurado corretamente:

```bash
echo "=== Verificação do Ambiente Agenda Tech ==="

echo "Node.js:"
node --version

echo "npm:"
npm --version

echo "Git:"
git --version

echo "PostgreSQL:"
psql --version

echo "GitHub CLI:"
gh --version

echo "=== Verificação concluída ==="
```

Se todos os comandos retornarem versões compatíveis com os pré-requisitos listados acima, o ambiente está pronto para desenvolvimento.

---

## Referências

- [Node.js — Documentação Oficial](https://nodejs.org/docs/latest-v20.x/api/)
- [Express.js — Guia](https://expressjs.com/pt-br/)
- [React — Documentação](https://react.dev/)
- [Vite — Documentação](https://vitejs.dev/)
- [PostgreSQL 16 — Documentação](https://www.postgresql.org/docs/16/)
- [GitHub Actions — Documentação](https://docs.github.com/pt/actions)
- [ESLint — Documentação](https://eslint.org/docs/latest/)
- [Prettier — Documentação](https://prettier.io/docs/en/)
