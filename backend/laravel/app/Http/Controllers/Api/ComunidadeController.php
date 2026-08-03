<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PaginaResultados;
use App\Http\Controllers\Api\Concerns\SalvaComRegrasDeNegocio;
use App\Http\Controllers\Controller;
use App\Http\Requests\ComunidadeStoreRequest;
use App\Http\Requests\ComunidadeUpdateRequest;
use App\Http\Resources\ComunidadeDetailResource;
use App\Http\Resources\ComunidadeResource;
use App\Http\Resources\EventoResource;
use App\Models\Comunidade;
use App\Models\ComunidadeMembro;
use App\Support\Permissions;
use Illuminate\Http\Request;

class ComunidadeController extends Controller
{
    use PaginaResultados, SalvaComRegrasDeNegocio;

    public function index(Request $request)
    {
        $query = Comunidade::query()->withCount('membros');

        if ($cidade = $request->query('cidade')) {
            $query->whereRaw('LOWER(cidade) = ?', [mb_strtolower($cidade)]);
        }

        $resultado = $this->paginar($query, (int) $request->query('pagina', 1), (int) $request->query('limite', 20));

        return response()->json([
            'dados' => ComunidadeResource::collection($resultado['itens']),
            'paginacao' => $resultado['paginacao'],
        ]);
    }

    public function show(Comunidade $comunidade)
    {
        $comunidade->load(['criadoPor', 'membrosVinculo.usuario']);

        return new ComunidadeDetailResource($comunidade);
    }

    public function store(ComunidadeStoreRequest $request)
    {
        $user = $request->user('api');

        if (Comunidade::nomeDuplicado($request->input('nome'))) {
            abort(409, 'Já existe uma comunidade com este nome.');
        }

        $comunidade = new Comunidade($request->validated());
        $comunidade->criado_por_id = $user->id;
        $this->salvarOuFalhar($comunidade, 'Já existe uma comunidade com este nome.');

        // RN-COM-08 / RN-ORG-04: criador é automaticamente organizador
        ComunidadeMembro::create([
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $user->id,
            'papel' => ComunidadeMembro::ORGANIZADOR,
            'adicionado_por_id' => $user->id,
        ]);

        $comunidade->load(['criadoPor', 'membrosVinculo.usuario']);

        return (new ComunidadeDetailResource($comunidade))
            ->response()
            ->setStatusCode(201);
    }

    public function update(ComunidadeUpdateRequest $request, Comunidade $comunidade)
    {
        $user = $request->user('api');

        if (! Permissions::isOrganizador($user, $comunidade)) {
            abort(403, 'Apenas organizadores podem editar esta comunidade.');
        }

        $dados = $request->validated();

        if (array_key_exists('nome', $dados) && Comunidade::nomeDuplicado($dados['nome'], $comunidade->id)) {
            abort(409, 'Já existe uma comunidade com este nome.');
        }

        $comunidade->fill($dados);
        $this->salvarOuFalhar($comunidade, 'Já existe uma comunidade com este nome.');

        $comunidade->load(['criadoPor', 'membrosVinculo.usuario']);

        return new ComunidadeDetailResource($comunidade);
    }

    public function destroy(Request $request, Comunidade $comunidade)
    {
        $user = $request->user('api');

        if (! Permissions::isOrganizador($user, $comunidade)) {
            abort(403, 'Apenas organizadores podem excluir esta comunidade.');
        }

        // RN-COM-09: não excluir comunidade com eventos futuros agendados
        if ($comunidade->eventos()->whereDate('data', '>=', now()->toDateString())->exists()) {
            abort(400, 'Não é possível excluir uma comunidade com eventos futuros agendados.');
        }

        $comunidade->delete();

        return response()->noContent();
    }

    public function eventos(Request $request, Comunidade $comunidade)
    {
        $query = $comunidade->eventos()->with(['comunidade', 'organizador']);

        if ($dataInicio = $request->query('data_inicio')) {
            $query->whereDate('data', '>=', $dataInicio);
        }
        if ($dataFim = $request->query('data_fim')) {
            $query->whereDate('data', '<=', $dataFim);
        }

        $resultado = $this->paginar($query, (int) $request->query('pagina', 1), (int) $request->query('limite', 20));

        return response()->json([
            'dados' => EventoResource::collection($resultado['itens']),
            'paginacao' => $resultado['paginacao'],
        ]);
    }
}
