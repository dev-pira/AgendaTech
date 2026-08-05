<?php

namespace App\Http\Requests;

use App\Models\Evento;
use Illuminate\Foundation\Http\FormRequest;

class EventoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string'],
            'descricao' => ['sometimes', 'required', 'string'],
            'data' => ['sometimes', 'required', 'date'],
            'hora_inicio' => ['sometimes', 'required', 'date_format:H:i,H:i:s'],
            'hora_fim' => ['sometimes', 'nullable', 'date_format:H:i,H:i:s'],
            'local' => ['sometimes', 'required', 'string', 'max:300'],
            'tipo' => ['sometimes', 'required', 'in:'.implode(',', Evento::TIPOS)],
            'url_online' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
