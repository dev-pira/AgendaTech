<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Comunidade */
class ComunidadeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'cidade' => $this->cidade,
            'contato' => $this->contato,
            'logo_url' => $this->logo_url,
            'criado_em' => $this->created_at,
            'total_membros' => $this->membros_count ?? $this->membros()->count(),
        ];
    }
}
