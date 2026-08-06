<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Contracts\Database\Eloquent\Builder as BuilderContract;

/**
 * Espelha a função `_paginar` de core/api.py (Django).
 *
 * Tipado com a contract BuilderContract, não a classe concreta
 * Illuminate\Database\Eloquent\Builder: uma relação Eloquent
 * (Comunidade::eventos()->with(...), por exemplo) devolve a própria
 * relação (HasMany), não um Builder — forwardDecoratedCallTo() faz
 * isso de propósito pra manter o encadeamento fluente. HasMany não é
 * subclasse de Builder, só implementa a mesma contract; tipar pela
 * classe concreta quebra em runtime com TypeError pra todo endpoint
 * que pagina uma relação aninhada (ex.: GET /comunidades/:id/eventos,
 * GET /comunidades/:id/membros).
 */
trait PaginaResultados
{
    protected function paginar(BuilderContract $query, int $pagina, int $limite): array
    {
        if ($pagina < 1) {
            abort(400, "O parâmetro 'pagina' deve ser um número inteiro positivo.");
        }

        if ($limite < 1 || $limite > 100) {
            abort(400, "O parâmetro 'limite' deve estar entre 1 e 100.");
        }

        $paginator = $query->paginate($limite, ['*'], 'pagina', $pagina);

        return [
            'itens' => collect($paginator->items()),
            'paginacao' => [
                'pagina_atual' => $paginator->currentPage(),
                'total_paginas' => max($paginator->lastPage(), 1),
                'total_itens' => $paginator->total(),
                'limite' => $limite,
            ],
        ];
    }
}
