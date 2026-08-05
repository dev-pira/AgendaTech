<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/** @mixin \App\Models\Comunidade */
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
