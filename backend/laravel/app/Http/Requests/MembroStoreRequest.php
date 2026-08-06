<?php

namespace App\Http\Requests;

use App\Models\ComunidadeMembro;
use Illuminate\Foundation\Http\FormRequest;

class MembroStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Apenas checagens de presença/tipo — as regras de negócio (email
     * corresponder a usuário existente, sem duplicidade) ficam no
     * controller, igual ao padrão de Comunidade/Evento.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'papel' => ['required', 'in:'.ComunidadeMembro::ORGANIZADOR.','.ComunidadeMembro::MEMBRO],
        ];
    }
}
