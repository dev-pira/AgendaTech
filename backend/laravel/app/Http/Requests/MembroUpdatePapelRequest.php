<?php

namespace App\Http\Requests;

use App\Models\ComunidadeMembro;
use Illuminate\Foundation\Http\FormRequest;

class MembroUpdatePapelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'papel' => ['required', 'in:'.ComunidadeMembro::ORGANIZADOR.','.ComunidadeMembro::MEMBRO],
        ];
    }
}
