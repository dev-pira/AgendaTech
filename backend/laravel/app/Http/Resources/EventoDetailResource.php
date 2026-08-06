<?php

namespace App\Http\Resources;

use App\Models\Evento;
use Illuminate\Http\Request;

/** @mixin Evento */
class EventoDetailResource extends EventoResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'url_online' => $this->url_online,
            'comunidade' => new ComunidadeResumoComCidadeResource($this->comunidade),
            'criado_em' => $this->created_at,
            'atualizado_em' => $this->updated_at,
        ];
    }
}
