# Integração com o Backend Real — Runbook

Este documento é para quem for **publicar o backend** e conectar o frontend a ele — não é o guia
de desenvolvimento do frontend (esse é o [`frontend/README.md`](../../frontend/README.md)).

## Resumo

O frontend já sabe falar com uma API real — só precisa de duas variáveis de ambiente. Nenhum
código muda quando o backend for publicado.

## O que configurar

| Variável | Valor quando o backend estiver publicado | Onde |
|---|---|---|
| `VITE_USE_MOCK` | `false` | Vercel (por ambiente) ou `.env` |
| `VITE_API_URL` | URL base completa da API, ex.: `https://api.seu-dominio.com/api` | Vercel (por ambiente) ou `.env` |

Sem essas duas variáveis definidas, o frontend roda em **modo mock** (dados fake em memória,
ver [`frontend/README.md#modo-mock`](../../frontend/README.md#modo-mock)) — é o comportamento
padrão hoje, enquanto o backend não está disponível.

## Passo a passo

1. Publique o backend em algum endereço acessível publicamente (isso é responsabilidade do time
   de backend — não faz parte deste runbook).
2. No painel da Vercel do projeto do frontend (Project → Settings → Environment Variables),
   defina `VITE_USE_MOCK=false` e `VITE_API_URL=<url-do-backend>/api` para o(s) ambiente(s)
   relevante(s) (Production e/ou Preview — ver a tabela completa de ambientes em
   [`.kiro/specs/frontend-vercel-deploy/design.md`](../../.kiro/specs/frontend-vercel-deploy/design.md#componente-2-variáveis-de-ambiente-por-ambiente-vercel)).
3. Dispare um novo deploy (a Vercel builda o valor das variáveis dentro do bundle — é
   **build-time**, não runtime; mudar a URL depois exige um novo deploy, não é uma config que se
   troca "ao vivo" sem rebuild).
4. Confirme que a aplicação para de mostrar o badge "dados de demonstração" no header — é o sinal
   visual de que o modo mock desligou de verdade.

## Formato esperado da URL

`VITE_API_URL` é a URL **base** da API, incluindo o prefixo `/api` se o backend usar um (o
backend atual do projeto, em `backend/`, expõe suas rotas sob `/api` — ver
[`backend/README.md`](../../backend/README.md)). Exemplo: se o backend responde em
`https://backend.exemplo.com/api/comunidades`, então `VITE_API_URL=https://backend.exemplo.com/api`.

## O que acontece se esquecer de configurar

Se `VITE_USE_MOCK=false` mas `VITE_API_URL` não for definida, o frontend tenta chamar `/api`
relativo ao próprio domínio onde ele está hospedado — que quase certamente não existe lá,
resultando em erros de rede visíveis na tela (não em dado mockado aparecendo por engano). A partir
desta versão, esse cenário também gera um aviso explícito no console do navegador
(`frontend/src/services/http.ts`), pra facilitar notar a configuração ausente sem precisar
inspecionar requests de rede.

## Local development / Docker

Para desenvolver localmente contra um backend real (não publicado), não é necessário
`VITE_API_URL` — o proxy do Vite já resolve isso (`frontend/vite.config.ts`) ou, se estiver usando
o `docker-compose.yml` da raiz, a variável `VITE_API_PROXY_TARGET` já aponta pro serviço
`backend` da rede do Compose. `VITE_API_URL` só é necessário quando o frontend e o backend estão
publicados em domínios diferentes (o caso da Vercel).
