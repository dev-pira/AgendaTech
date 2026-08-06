<?php

namespace App\Http\Resources;

use App\Models\ComunidadeMembro;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource dos endpoints de gestão de membros (MembroController) —
 * distinto de MembroResource (usado em ComunidadeDetailResource, mais
 * enxuto). Espelha o `serializar()` de membros.service.js (Node).
 *
 * @mixin ComunidadeMembro
 */
class MembroGestaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'comunidade_id' => $this->comunidade_id,
            'usuario_id' => $this->usuario_id,
            'papel' => $this->papel,
            'adicionado_em' => $this->adicionado_em,
            'adicionado_por_id' => $this->adicionado_por_id,
            'usuario' => new UsuarioResumoComEmailResource($this->whenLoaded('usuario')),
        ];
    }
}
