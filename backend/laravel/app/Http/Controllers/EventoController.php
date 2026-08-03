<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\SalvaFormulario;
use App\Http\Requests\EventoStoreRequest;
use App\Http\Requests\EventoUpdateRequest;
use App\Models\Comunidade;
use App\Models\Evento;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Views server-rendered (HTML puro, sem API) de eventos.
 * Reaproveita o mesmo model Evento (e as mesmas regras de negócio) que a
 * API — ver Http/Controllers/Api/EventoController. Espelha
 * core/views.py (Django).
 */
class EventoController extends Controller
{
    use SalvaFormulario;

    public function index(Request $request)
    {
        $query = Evento::query()->with(['comunidade', 'organizador']);

        $comunidadeId = trim((string) $request->query('comunidade', ''));
        $cidade = trim((string) $request->query('cidade', ''));
        $tipo = trim((string) $request->query('tipo', ''));
        $dataInicio = trim((string) $request->query('data_inicio', ''));
        $dataFim = trim((string) $request->query('data_fim', ''));

        if ($comunidadeId !== '') {
            $query->where('comunidade_id', $comunidadeId);
        }
        if ($cidade !== '') {
            $query->whereHas('comunidade', fn ($q) => $q->whereRaw('LOWER(cidade) = ?', [mb_strtolower($cidade)]));
        }
        if ($tipo !== '') {
            $query->where('tipo', $tipo);
        }
        if ($dataInicio !== '') {
            $query->whereDate('data', '>=', $dataInicio);
        }
        if ($dataFim !== '') {
            $query->whereDate('data', '<=', $dataFim);
        }

        $eventos = $query->paginate(12, ['*'], 'pagina')->withQueryString();

        return view('eventos.index', [
            'eventos' => $eventos,
            'comunidades' => Comunidade::all(),
            'comunidadeSelecionada' => $comunidadeId,
            'cidade' => $cidade,
            'tipo' => $tipo,
            'dataInicio' => $dataInicio,
            'dataFim' => $dataFim,
        ]);
    }

    public function show(Evento $evento)
    {
        $evento->load(['comunidade', 'organizador']);
        $podeGerenciar = Auth::check()
            && Permissions::isOrganizador(Auth::user(), $evento->comunidade)
            && ! Carbon::parse($evento->data)->lt(now()->startOfDay());

        return view('eventos.show', ['evento' => $evento, 'podeGerenciar' => $podeGerenciar]);
    }

    public function create()
    {
        $comunidadesUsuario = Comunidade::query()->whereHas('membros', fn ($q) => $q->where('comunidade_membros.usuario_id', Auth::id()))->get();

        if ($comunidadesUsuario->isEmpty()) {
            return redirect()->route('comunidades.index')
                ->with('error', 'Você precisa ser membro de uma comunidade para criar eventos.');
        }

        return view('eventos.form', ['modo' => 'criar', 'evento' => null, 'comunidades' => $comunidadesUsuario]);
    }

    public function store(EventoStoreRequest $request)
    {
        $dados = $request->validated();
        $comunidade = Comunidade::findOrFail($dados['comunidade_id']);

        if (! Permissions::isMembroOuOrganizador(Auth::user(), $comunidade)) {
            return back()->withInput()
                ->with('error', 'Você precisa ser membro ou organizador desta comunidade para criar eventos.');
        }

        // RN-EVT-04
        if (Carbon::parse($dados['data'])->lt(now()->startOfDay())) {
            throw ValidationException::withMessages([
                'data' => 'A data do evento deve ser futura ou igual à data atual.',
            ]);
        }

        $evento = new Evento($this->normalizarHoras($dados));
        $evento->comunidade_id = $comunidade->id;
        $evento->organizador_id = Auth::id();
        $this->salvarOuVoltar($evento, 'titulo', 'Já existe um evento com este título nesta data para esta comunidade.');

        return redirect()->route('eventos.show', $evento)
            ->with('success', 'Evento criado com sucesso.');
    }

    public function edit(Evento $evento)
    {
        if (! Permissions::isOrganizador(Auth::user(), $evento->comunidade)) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Apenas organizadores da comunidade podem editar este evento.');
        }
        if (Carbon::parse($evento->data)->lt(now()->startOfDay())) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Não é possível editar eventos que já ocorreram.');
        }

        $comunidadesUsuario = Comunidade::query()->whereHas('membros', fn ($q) => $q->where('comunidade_membros.usuario_id', Auth::id()))->get();

        return view('eventos.form', ['modo' => 'editar', 'evento' => $evento, 'comunidades' => $comunidadesUsuario]);
    }

    public function update(EventoUpdateRequest $request, Evento $evento)
    {
        if (! Permissions::isOrganizador(Auth::user(), $evento->comunidade)) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Apenas organizadores da comunidade podem editar este evento.');
        }
        if (Carbon::parse($evento->data)->lt(now()->startOfDay())) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Não é possível editar eventos que já ocorreram.');
        }

        $evento->fill($this->normalizarHoras($request->validated()));
        $this->salvarOuVoltar($evento, 'titulo', 'Já existe um evento com este título nesta data para esta comunidade.');

        return redirect()->route('eventos.show', $evento)
            ->with('success', 'Evento atualizado com sucesso.');
    }

    public function confirmDelete(Evento $evento)
    {
        if (! Permissions::isOrganizador(Auth::user(), $evento->comunidade)) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Apenas organizadores da comunidade podem excluir este evento.');
        }
        if (Carbon::parse($evento->data)->lt(now()->startOfDay())) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Não é possível excluir eventos que já ocorreram.');
        }

        return view('eventos.confirm-delete', ['evento' => $evento]);
    }

    public function destroy(Evento $evento)
    {
        if (! Permissions::isOrganizador(Auth::user(), $evento->comunidade)) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Apenas organizadores da comunidade podem excluir este evento.');
        }
        if (Carbon::parse($evento->data)->lt(now()->startOfDay())) {
            return redirect()->route('eventos.show', $evento)
                ->with('error', 'Não é possível excluir eventos que já ocorreram.');
        }

        $evento->delete();

        return redirect()->route('eventos.index')
            ->with('success', 'Evento excluído com sucesso.');
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
}
