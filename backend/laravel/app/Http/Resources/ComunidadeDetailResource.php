<?php

namespace App\Http\Resources;

use App\Models\Comunidade;
use Illuminate\Http\Request;

/** @mixin Comunidade */
class ComunidadeDetailResource extends ComunidadeResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'atualizado_em' => $this->updated_at,
            'criado_por' => new UsuarioResumoResource($this->criadoPor),
            'membros' => MembroResource::collection($this->membrosVinculo),
        ];
    }
}
