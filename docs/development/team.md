# Time de Desenvolvimento (Subagentes)

Como o desenvolvimento do frontend do Agenda Tech é conduzido usando um time de subagentes do
Claude Code, simulando papéis de um time de engenharia real, com revisão obrigatória antes de
qualquer commit.

## Papéis

Definidos em [`.claude/agents/`](../../.claude/agents/) — cada um é um subagente real,
invocável via Agent tool, reutilizável em qualquer sessão futura (não é um processo que existe
só na cabeça de quem está conduzindo a sessão).

| Agente | Responsabilidade | Quando é acionado |
|---|---|---|
| **tech-lead** | Divide o trabalho, aciona especialistas, integra revisões, decide corte de rounds, faz o commit final | Sempre — é a sessão principal, não um subagente separado |
| [`frontend-engineer`](../../.claude/agents/frontend-engineer.md) | Implementa telas/componentes React seguindo `docs/design/design-system.md` e o contrato em `src/types/api.ts` | Toda feature/fix de frontend |
| [`ui-designer`](../../.claude/agents/ui-designer.md) | Revisa contra o design system — bloqueante | Depois de toda mudança visual, antes do commit |
| [`qa-engineer`](../../.claude/agents/qa-engineer.md) | Valida o fluxo de verdade (mock ou backend real) contra os critérios de aceite do escopo funcional | Depois de toda feature que envolve fluxo de dados/usuário |
| [`backend-engineer`](../../.claude/agents/backend-engineer.md) | Muda `backend/` | Só sob pedido explícito — backend é tratado como de outro time |
| [`code-reviewer`](../../.claude/agents/code-reviewer.md) | Audita Clean Code/SOLID no diff | Antes do commit, em paralelo ao `ui-designer` |
| [`release-engineer`](../../.claude/agents/release-engineer.md) | Versionamento, changelog, CI/CD | Ao preparar release ou mexer em config de deploy |

## Fluxo de uma feature

```
tech-lead recebe o pedido
  └─ divide em unidades de trabalho pequenas (uma por commit atômico)
      └─ frontend-engineer implementa a unidade
          └─ ui-designer revisa (design system)  ─┐
          └─ code-reviewer revisa (Clean Code)    ─┼─ em paralelo, leem só o diff
          └─ qa-engineer valida (funciona de fato) ─┘
              ├─ tudo aprovado → tech-lead integra e commita (Conventional Commits)
              └─ achado bloqueante → volta pro frontend-engineer, no máximo 2 rounds
                  antes do tech-lead decidir manualmente (ver economia de tokens abaixo)
```

Divergências entre agentes (ex.: `ui-designer` reprova algo que `code-reviewer` não mencionou)
não são um problema — são o ponto do processo. O `tech-lead` consolida o resultado final, não
cada subagente individualmente.

## Economia de tokens/custo

Regra explícita do projeto, não um detalhe de implementação:

1. **Delegação escopada**: cada subagente recebe a tarefa específica (arquivo, contrato,
   critério de aceite) — nunca "aqui está o repo inteiro, resolve".
2. **Revisores leem o diff, não o repositório**: `ui-designer` e `code-reviewer` operam sobre a
   mudança proposta, não releem tudo do zero a cada chamada.
3. **Tarefas mecânicas não passam por subagente**: lint fix, formatação, rename — o tech-lead
   resolve direto.
4. **Rounds de revisão limitados**: no máximo 2 idas e voltas entre implementação e revisão por
   unidade de trabalho; no round 3, o tech-lead decide manualmente em vez de re-delegar
   indefinidamente.
5. **Checkpoints via `TaskCreate`/`TaskUpdate`** em vez de re-explicar o estado do trabalho a
   cada turno da conversa.

## Commits

Subagentes **não commitam**. Eles implementam e reportam; o `tech-lead` (sessão principal)
integra e cria o commit — isso mantém o histórico coerente e evita commits duplicados/conflitantes
de agentes rodando em paralelo. Ver [`git-workflow.md`](./git-workflow.md) para a convenção de
commits e versionamento.
