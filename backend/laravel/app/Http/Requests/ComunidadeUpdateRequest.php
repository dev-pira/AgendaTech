<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ComunidadeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => ['sometimes', 'required', 'string'],
            'descricao' => ['sometimes', 'required', 'string', 'max:1000'],
            'cidade' => ['sometimes', 'required', 'string', 'max:100'],
            'contato' => ['sometimes', 'required', 'string', 'max:255'],
            'logo_url' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
