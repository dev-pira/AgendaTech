<?php

namespace App\Http\Requests;

use App\Models\Evento;
use Illuminate\Foundation\Http\FormRequest;

class CalendarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Espelha calendario.validator.js (Node): data_inicio/data_fim são
     * obrigatórios (diferente da listagem genérica de eventos, onde são
     * opcionais) — o endpoint existe pra alimentar uma tela de
     * calendário, que sempre tem um período definido.
     */
    public function rules(): array
    {
        return [
            'data_inicio' => ['required', 'date_format:Y-m-d'],
            'data_fim' => ['required', 'date_format:Y-m-d', 'after_or_equal:data_inicio'],
            'comunidade_id' => ['nullable', 'uuid', 'exists:comunidades,id'],
            'cidade' => ['nullable', 'string'],
            'tipo' => ['nullable', 'in:'.implode(',', Evento::TIPOS)],
        ];
    }
}
