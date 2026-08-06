<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\PaginaResultados;
use App\Http\Controllers\Controller;
use App\Http\Requests\MembroStoreRequest;
use App\Http\Requests\MembroUpdatePapelRequest;
use App\Http\Resources\MembroGestaoResource;
use App\Models\Comunidade;
use App\Models\ComunidadeMembro;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\Request;

/**
 * Gestão de membros/organizadores por comunidade — espelha
 * backend/src/{routes,controllers,services}/membros.* (Node), nunca
 * portado pro Laravel na migração de stack (issue #9 original, fechada
 * Done no PR #12, mas só existia na stack Node). Ver issue #53.
 */
class MembroController extends Controller
{
    use PaginaResultados;

    public function index(Request $request, Comunidade $comunidade)
    {
        $query = $comunidade->membrosVinculo()->with('usuario');

        if ($papel = $request->query('papel')) {
            $query->where('papel', $papel);
        }

        $resultado = $this->paginar($query, (int) $request->query('pagina', 1), (int) $request->query('limite', 20));

        return response()->json([
            'dados' => MembroGestaoResource::collection($resultado['itens']),
            'paginacao' => $resultado['paginacao'],
        ]);
    }

    public function store(MembroStoreRequest $request, Comunidade $comunidade)
    {
        $requisitante = $request->user('api');

        if (! Permissions::isOrganizador($requisitante, $comunidade)) {
            abort(403, 'Apenas organizadores da comunidade podem gerenciar membros.');
        }

        // RN-ORG-04: email deve corresponder a um usuário existente
        $usuarioAlvo = User::where('email', $request->validated('email'))->first();
        if (! $usuarioAlvo) {
            abort(404, 'Nenhum usuário cadastrado com esse email.');
        }

        $jaMembro = ComunidadeMembro::where('comunidade_id', $comunidade->id)
            ->where('usuario_id', $usuarioAlvo->id)
            ->exists();
        if ($jaMembro) {
            abort(409, 'Usuário já é membro dessa comunidade.');
        }

        $membro = ComunidadeMembro::create([
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $usuarioAlvo->id,
            'papel' => $request->validated('papel'),
            'adicionado_por_id' => $requisitante->id,
        ]);

        $membro->load('usuario');

        return (new MembroGestaoResource($membro))
            ->response()
            ->setStatusCode(201);
    }

    public function updatePapel(MembroUpdatePapelRequest $request, Comunidade $comunidade, string $usuarioId)
    {
        $requisitante = $request->user('api');

        if (! Permissions::isOrganizador($requisitante, $comunidade)) {
            abort(403, 'Apenas organizadores da comunidade podem gerenciar membros.');
        }

        $membro = $this->localizarMembro($comunidade, $usuarioId);

        $novoPapel = $request->validated('papel');

        // RN-ORG-01: sempre precisa sobrar ao menos 1 organizador
        if ($membro->papel === ComunidadeMembro::ORGANIZADOR && $novoPapel === ComunidadeMembro::MEMBRO) {
            $this->garantirNaoUltimoOrganizador($comunidade);
        }

        $membro->papel = $novoPapel;
        $membro->save();
        $membro->load('usuario');

        return new MembroGestaoResource($membro);
    }

    public function destroy(Request $request, Comunidade $comunidade, string $usuarioId)
    {
        $requisitante = $request->user('api');

        if (! Permissions::isOrganizador($requisitante, $comunidade)) {
            abort(403, 'Apenas organizadores da comunidade podem gerenciar membros.');
        }

        $membro = $this->localizarMembro($comunidade, $usuarioId);

        if ($membro->papel === ComunidadeMembro::ORGANIZADOR) {
            $this->garantirNaoUltimoOrganizador($comunidade);
        }

        $membro->delete();

        return response()->noContent();
    }

    private function localizarMembro(Comunidade $comunidade, string $usuarioId): ComunidadeMembro
    {
        $membro = ComunidadeMembro::where('comunidade_id', $comunidade->id)
            ->where('usuario_id', $usuarioId)
            ->first();

        if (! $membro) {
            abort(404, 'Membro não encontrado nessa comunidade.');
        }

        return $membro;
    }

    private function garantirNaoUltimoOrganizador(Comunidade $comunidade): void
    {
        $totalOrganizadores = ComunidadeMembro::where('comunidade_id', $comunidade->id)
            ->where('papel', ComunidadeMembro::ORGANIZADOR)
            ->count();

        if ($totalOrganizadores <= 1) {
            abort(422, 'Não é possível remover o último organizador da comunidade.');
        }
    }
}
