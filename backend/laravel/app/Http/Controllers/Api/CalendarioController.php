<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CalendarioRequest;
use App\Http\Resources\EventoDetailResource;
use App\Models\Evento;

/**
 * Endpoint agregador pra tela de calendário compartilhado do
 * frontend (DevItape) — espelha
 * backend/src/controllers/calendario.controller.js (Node), nunca
 * portado pro Laravel na migração de stack (issue #10 original,
 * fechada Done no PR #12, mas só existia na stack Node). Ver issue #54.
 *
 * Público (sem autenticação), diferente de GET /eventos: aqui o
 * período é obrigatório, então a resposta não é paginada — devolve
 * todos os eventos do intervalo de uma vez.
 */
class CalendarioController extends Controller
{
    public function index(CalendarioRequest $request)
    {
        $dados = $request->validated();

        $query = Evento::query()
            ->with(['comunidade', 'organizador'])
            ->whereDate('data', '>=', $dados['data_inicio'])
            ->whereDate('data', '<=', $dados['data_fim'])
            ->orderBy('data')
            ->orderBy('hora_inicio');

        if (! empty($dados['comunidade_id'])) {
            $query->where('comunidade_id', $dados['comunidade_id']);
        }

        if (! empty($dados['cidade'])) {
            $query->whereHas('comunidade', fn ($q) => $q->whereRaw('LOWER(cidade) = ?', [mb_strtolower($dados['cidade'])]));
        }

        if (! empty($dados['tipo'])) {
            $query->where('tipo', $dados['tipo']);
        }

        $eventos = $query->get();

        return response()->json([
            'eventos' => EventoDetailResource::collection($eventos),
            'total' => $eventos->count(),
            'periodo' => [
                'data_inicio' => $dados['data_inicio'],
                'data_fim' => $dados['data_fim'],
            ],
        ]);
    }
}
