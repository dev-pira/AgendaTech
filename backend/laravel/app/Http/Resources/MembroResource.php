<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ComunidadeMembro */
class MembroResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'usuario_id' => $this->usuario_id,
            'nome' => $this->usuario->nomeExibicao(),
            'papel' => $this->papel,
        ];
    }
}
