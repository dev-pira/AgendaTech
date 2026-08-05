<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PaginaResultados;
use App\Http\Controllers\Api\Concerns\SalvaComRegrasDeNegocio;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventoStoreRequest;
use App\Http\Requests\EventoUpdateRequest;
use App\Http\Resources\EventoDetailResource;
use App\Http\Resources\EventoResource;
use App\Models\Comunidade;
use App\Models\Evento;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EventoController extends Controller
{
    use PaginaResultados, SalvaComRegrasDeNegocio;

    public function index(Request $request)
    {
        $query = Evento::query()->with(['comunidade', 'organizador']);

        if ($comunidadeId = $request->query('comunidade_id')) {
            $query->where('comunidade_id', $comunidadeId);
        }
        if ($cidade = $request->query('cidade')) {
            $query->whereHas('comunidade', fn ($q) => $q->whereRaw('LOWER(cidade) = ?', [mb_strtolower($cidade)]));
        }
        if ($dataInicio = $request->query('data_inicio')) {
            $query->whereDate('data', '>=', $dataInicio);
        }
        if ($dataFim = $request->query('data_fim')) {
            $query->whereDate('data', '<=', $dataFim);
        }
        if ($tipo = $request->query('tipo')) {
            $query->where('tipo', $tipo);
        }

        $resultado = $this->paginar($query, (int) $request->query('pagina', 1), (int) $request->query('limite', 20));

        return response()->json([
            'dados' => EventoResource::collection($resultado['itens']),
            'paginacao' => $resultado['paginacao'],
        ]);
    }

    public function show(Evento $evento)
    {
        $evento->load(['comunidade', 'organizador']);

        return new EventoDetailResource($evento);
    }

    public function store(EventoStoreRequest $request)
    {
        $user = $request->user('api');
        $dados = $request->validated();
        $comunidade = Comunidade::findOrFail($dados['comunidade_id']);

        // RN-EVT-07
        if (! Permissions::isMembroOuOrganizador($user, $comunidade)) {
            abort(403, 'Você precisa ser membro ou organizador desta comunidade para criar eventos.');
        }

        // RN-EVT-04
        if (Carbon::parse($dados['data'])->lt(now()->startOfDay())) {
            abort(400, 'A data do evento deve ser futura ou igual à data atual.');
        }

        // RN-EVT-09
        if ($this->eventoDuplicado($comunidade->id, $dados['titulo'], $dados['data'])) {
            abort(409, 'Já existe um evento com este título nesta data para esta comunidade.');
        }

        $evento = new Evento($this->normalizarHoras($dados));
        $evento->comunidade_id = $comunidade->id;
        $evento->organizador_id = $user->id;
        $this->salvarOuFalhar($evento, 'Já existe um evento com este título nesta data para esta comunidade.');

        $evento->load(['comunidade', 'organizador']);

        return (new EventoDetailResource($evento))
            ->response()
            ->setStatusCode(201);
    }

    public function update(EventoUpdateRequest $request, Evento $evento)
    {
        $user = $request->user('api');

        if (! Permissions::isOrganizador($user, $evento->comunidade)) {
            abort(403, 'Apenas organizadores da comunidade podem editar este evento.');
        }

        // RN-EVT-10
        if (Carbon::parse($evento->data)->lt(now()->startOfDay())) {
            abort(400, 'Não é possível editar eventos que já ocorreram.');
        }

        $evento->fill($this->normalizarHoras($request->validated()));
        $this->salvarOuFalhar($evento, 'Já existe um evento com este título nesta data para esta comunidade.');

        $evento->load(['comunidade', 'organizador']);

        return new EventoDetailResource($evento);
    }

    public function destroy(Request $request, Evento $evento)
    {
        $user = $request->user('api');

        if (! Permissions::isOrganizador($user, $evento->comunidade)) {
            abort(403, 'Apenas organizadores da comunidade podem excluir este evento.');
        }

        // RN-EVT-10
        if (Carbon::parse($evento->data)->lt(now()->startOfDay())) {
            abort(400, 'Não é possível excluir eventos que já ocorreram.');
        }

        $evento->delete();

        return response()->noContent();
    }

    private function normalizarHoras(array $dados): array
    {
        foreach (['hora_inicio', 'hora_fim'] as $campo) {
            if (! empty($dados[$campo])) {
                $dados[$campo] = Carbon::parse($dados[$campo])->format('H:i:s');
            }
        }

        return $dados;
    }

    private function eventoDuplicado(string $comunidadeId, string $titulo, string $data): bool
    {
        return Evento::query()
            ->where('comunidade_id', $comunidadeId)
            ->whereRaw('LOWER(titulo) = ?', [mb_strtolower($titulo)])
            ->whereDate('data', $data)
            ->exists();
    }
}
