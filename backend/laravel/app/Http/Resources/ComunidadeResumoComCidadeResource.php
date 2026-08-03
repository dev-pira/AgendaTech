<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/** @mixin \App\Models\Comunidade */
class ComunidadeResumoComCidadeResource extends ComunidadeResumoResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'cidade' => $this->cidade,
        ];
    }
}
