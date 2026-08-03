<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Database\Eloquent\Builder;

/** Espelha a função `_paginar` de core/api.py (Django). */
trait PaginaResultados
{
    protected function paginar(Builder $query, int $pagina, int $limite): array
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
