<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Evento */
class EventoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'data' => $this->data->toDateString(),
            'hora_inicio' => $this->hora_inicio,
            'hora_fim' => $this->hora_fim,
            'local' => $this->local,
            'tipo' => $this->tipo,
            'comunidade' => new ComunidadeResumoResource($this->comunidade),
            'organizador' => new UsuarioResumoResource($this->organizador),
        ];
    }
}
