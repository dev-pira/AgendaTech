<?php

namespace App\Http\Requests;

use App\Models\Evento;
use Illuminate\Foundation\Http\FormRequest;

class EventoStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Apenas checagens de presença/tipo — as regras de negócio (tamanho do
     * título, url_online obrigatório para online/híbrido, etc.) ficam no
     * model Evento, para não divergir entre a versão web e a API.
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string'],
            'descricao' => ['required', 'string'],
            'data' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i,H:i:s'],
            'hora_fim' => ['nullable', 'date_format:H:i,H:i:s'],
            'local' => ['required', 'string', 'max:300'],
            'tipo' => ['required', 'in:'.implode(',', Evento::TIPOS)],
            'url_online' => ['nullable', 'string', 'max:500'],
            'comunidade_id' => ['required', 'uuid', 'exists:comunidades,id'],
        ];
    }
}
