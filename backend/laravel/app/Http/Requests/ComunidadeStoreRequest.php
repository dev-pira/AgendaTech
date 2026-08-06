<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComunidadeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Apenas checagens de presença/tipo — as regras de negócio (tamanho do
     * nome, formato do contato, etc.) ficam no model Comunidade, para não
     * divergir entre a versão web e a API.
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string'],
            'descricao' => ['required', 'string', 'max:1000'],
            'cidade' => ['required', 'string', 'max:100'],
            'contato' => ['required', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:500'],
        ];
    }
}
