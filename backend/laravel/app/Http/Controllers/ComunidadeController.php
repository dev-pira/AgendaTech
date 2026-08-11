<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\SalvaFormulario;
use App\Http\Requests\ComunidadeStoreRequest;
use App\Http\Requests\ComunidadeUpdateRequest;
use App\Models\Comunidade;
use App\Models\ComunidadeMembro;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Views server-rendered (HTML puro, sem API) de comunidades.
 * Reaproveita o mesmo model Comunidade (e as mesmas regras de negócio) que
 * a API — ver Http/Controllers/Api/ComunidadeController. Espelha
 * core/views.py (Django).
 */
class ComunidadeController extends Controller
{
    use SalvaFormulario;

    public function index(Request $request)
    {
        $busca = trim((string) $request->query('busca', ''));
        $cidade = trim((string) $request->query('cidade', ''));

        $query = Comunidade::query()->withCount('membros');
        if ($busca !== '') {
            $query->whereRaw('LOWER(nome) LIKE ?', ['%'.mb_strtolower($busca).'%']);
        }
        if ($cidade !== '') {
            $query->whereRaw('LOWER(cidade) = ?', [mb_strtolower($cidade)]);
        }

        $comunidades = $query->paginate(12, ['*'], 'pagina')->withQueryString();
        $cidades = Comunidade::query()->orderBy('cidade')->distinct()->pluck('cidade');

        return view('comunidades.index', [
            'comunidades' => $comunidades,
            'busca' => $busca,
            'cidadeSelecionada' => $cidade,
            'cidades' => $cidades,
        ]);
    }

    public function show(Comunidade $comunidade)
    {
        $comunidade->load(['membrosVinculo.usuario']);
        $proximosEventos = $comunidade->eventos()->whereDate('data', '>=', now()->toDateString())
            ->orderBy('data')->orderBy('hora_inicio')->get();
        $podeGerenciar = Auth::check() && Permissions::isOrganizador(Auth::user(), $comunidade);

        return view('comunidades.show', [
            'comunidade' => $comunidade,
            'membros' => $comunidade->membrosVinculo,
            'proximosEventos' => $proximosEventos,
            'podeGerenciar' => $podeGerenciar,
        ]);
    }

    public function create()
    {
        return view('comunidades.form', ['modo' => 'criar', 'comunidade' => null]);
    }

    public function store(ComunidadeStoreRequest $request)
    {
        $dados = $request->validated();

        if (Comunidade::nomeDuplicado($dados['nome'])) {
            throw ValidationException::withMessages(['nome' => 'Já existe uma comunidade com este nome.']);
        }

        $comunidade = new Comunidade($dados);
        $comunidade->criado_por_id = Auth::id();
        $this->salvarOuVoltar($comunidade, 'nome', 'Já existe uma comunidade com este nome.');

        // RN-COM-08 / RN-ORG-04: criador é automaticamente organizador
        ComunidadeMembro::create([
            'comunidade_id' => $comunidade->id,
            'usuario_id' => Auth::id(),
            'papel' => ComunidadeMembro::ORGANIZADOR,
            'adicionado_por_id' => Auth::id(),
        ]);

        return redirect()->route('comunidades.show', $comunidade)
            ->with('success', 'Comunidade criada com sucesso.');
    }

    public function edit(Comunidade $comunidade)
    {
        if (! Permissions::isOrganizador(Auth::user(), $comunidade)) {
            return redirect()->route('comunidades.show', $comunidade)
                ->with('error', 'Apenas organizadores podem editar esta comunidade.');
        }

        return view('comunidades.form', ['modo' => 'editar', 'comunidade' => $comunidade]);
    }

    public function update(ComunidadeUpdateRequest $request, Comunidade $comunidade)
    {
        if (! Permissions::isOrganizador(Auth::user(), $comunidade)) {
            return redirect()->route('comunidades.show', $comunidade)
                ->with('error', 'Apenas organizadores podem editar esta comunidade.');
        }

        $dados = $request->validated();

        if (array_key_exists('nome', $dados) && Comunidade::nomeDuplicado($dados['nome'], $comunidade->id)) {
            throw ValidationException::withMessages(['nome' => 'Já existe uma comunidade com este nome.']);
        }

        $comunidade->fill($dados);
        $this->salvarOuVoltar($comunidade, 'nome', 'Já existe uma comunidade com este nome.');

        return redirect()->route('comunidades.show', $comunidade)
            ->with('success', 'Comunidade atualizada com sucesso.');
    }

    public function confirmDelete(Comunidade $comunidade)
    {
        if (! Permissions::isOrganizador(Auth::user(), $comunidade)) {
            return redirect()->route('comunidades.show', $comunidade)
                ->with('error', 'Apenas organizadores podem excluir esta comunidade.');
        }

        return view('comunidades.confirm-delete', ['comunidade' => $comunidade]);
    }

    public function destroy(Comunidade $comunidade)
    {
        if (! Permissions::isOrganizador(Auth::user(), $comunidade)) {
            return redirect()->route('comunidades.show', $comunidade)
                ->with('error', 'Apenas organizadores podem excluir esta comunidade.');
        }

        // RN-COM-09
        if ($comunidade->eventos()->whereDate('data', '>=', now()->toDateString())->exists()) {
            return redirect()->route('comunidades.show', $comunidade)
                ->with('error', 'Não é possível excluir uma comunidade com eventos futuros agendados.');
        }

        $comunidade->delete();

        return redirect()->route('comunidades.index')
            ->with('success', 'Comunidade excluída com sucesso.');
    }
}
