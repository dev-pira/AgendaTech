<?php

namespace App\Http\Resources;

use App\Models\ComunidadeMembro;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ComunidadeMembro */
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
