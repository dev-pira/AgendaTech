@extends('layouts.app')

@section('title', 'Eventos')

@section('content')
    <h1>Eventos</h1>

    <form method="GET" action="{{ route('eventos.index') }}" style="display:flex; gap:.5rem; flex-wrap:wrap; align-items:end;">
        <div>
            <label for="comunidade">Comunidade</label>
            <select id="comunidade" name="comunidade">
                <option value="">Todas</option>
                @foreach ($comunidades as $c)
                    <option value="{{ $c->id }}" @selected($comunidadeSelecionada == $c->id)>{{ $c->nome }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label for="cidade">Cidade</label>
            <input type="text" id="cidade" name="cidade" value="{{ $cidade }}">
        </div>
        <div>
            <label for="tipo">Tipo</label>
            <select id="tipo" name="tipo">
                <option value="">Todos</option>
                <option value="presencial" @selected($tipo === 'presencial')>Presencial</option>
                <option value="online" @selected($tipo === 'online')>Online</option>
                <option value="hibrido" @selected($tipo === 'hibrido')>Híbrido</option>
            </select>
        </div>
        <div>
            <label for="data_inicio">De</label>
            <input type="date" id="data_inicio" name="data_inicio" value="{{ $dataInicio }}">
        </div>
        <div>
            <label for="data_fim">Até</label>
            <input type="date" id="data_fim" name="data_fim" value="{{ $dataFim }}">
        </div>
        <button type="submit">Filtrar</button>
    </form>

    @auth
        <p><a class="btn" href="{{ route('eventos.create') }}">+ Novo evento</a></p>
    @endauth

    @forelse ($eventos as $evento)
        <div class="card">
            <h2><a href="{{ route('eventos.show', $evento) }}">{{ $evento->titulo }}</a></h2>
            <p>{{ $evento->comunidade->nome }} — {{ $evento->data->format('d/m/Y') }} às {{ $evento->hora_inicio }} ({{ $evento->tipo }})</p>
        </div>
    @empty
        <p>Nenhum evento encontrado.</p>
    @endforelse

    <div class="pagination">
        {{ $eventos->links() }}
    </div>
@endsection
