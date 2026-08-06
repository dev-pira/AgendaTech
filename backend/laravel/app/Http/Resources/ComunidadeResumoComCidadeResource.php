<?php

namespace App\Http\Resources;

use App\Models\Comunidade;
use Illuminate\Http\Request;

/** @mixin Comunidade */
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
