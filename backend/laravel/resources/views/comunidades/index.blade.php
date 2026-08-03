@extends('layouts.app')

@section('title', 'Comunidades')

@section('content')
    <h1>Comunidades</h1>

    <form method="GET" action="{{ route('comunidades.index') }}" style="display:flex; gap:.5rem; align-items:end;">
        <div style="flex:1;">
            <label for="busca">Buscar</label>
            <input type="text" id="busca" name="busca" value="{{ $busca }}" placeholder="Nome da comunidade">
        </div>
        <div style="flex:1;">
            <label for="cidade">Cidade</label>
            <input type="text" id="cidade" name="cidade" value="{{ $cidadeSelecionada }}" placeholder="Cidade">
        </div>
        <button type="submit">Filtrar</button>
    </form>

    @auth
        <p><a class="btn" href="{{ route('comunidades.create') }}">+ Nova comunidade</a></p>
    @endauth

    @forelse ($comunidades as $comunidade)
        <div class="card">
            <h2><a href="{{ route('comunidades.show', $comunidade) }}">{{ $comunidade->nome }}</a></h2>
            <p>{{ $comunidade->cidade }} — {{ $comunidade->membros_count }} membro(s)</p>
            <p>{{ $comunidade->descricao }}</p>
        </div>
    @empty
        <p>Nenhuma comunidade encontrada.</p>
    @endforelse

    <div class="pagination">
        {{ $comunidades->links() }}
    </div>
@endsection
