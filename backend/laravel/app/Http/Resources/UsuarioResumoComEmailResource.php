<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Igual a UsuarioResumoResource, mas com email — usado só nos endpoints
 * de gestão de membros (MembroController), onde o email é necessário
 * pra quem já é organizador identificar outros membros. Espelha o
 * `usuario: { id, nome, email }` de membros.service.js (Node).
 *
 * @mixin User
 */
class UsuarioResumoComEmailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nomeExibicao(),
            'email' => $this->email,
        ];
    }
}
