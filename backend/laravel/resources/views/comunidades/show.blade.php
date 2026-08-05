@extends('layouts.app')

@section('title', $comunidade->nome)

@section('content')
    <h1>{{ $comunidade->nome }}</h1>
    <p><strong>Cidade:</strong> {{ $comunidade->cidade }}</p>
    <p><strong>Contato:</strong> {{ $comunidade->contato }}</p>
    <p>{{ $comunidade->descricao }}</p>

    @if ($podeGerenciar)
        <p>
            <a class="btn" href="{{ route('comunidades.edit', $comunidade) }}">Editar</a>
            <a class="btn btn-danger" href="{{ route('comunidades.confirm-delete', $comunidade) }}">Excluir</a>
        </p>
    @endif

    <h2>Membros</h2>
    <ul>
        @foreach ($membros as $membro)
            <li>{{ $membro->usuario->nomeExibicao() }} — {{ $membro->papel }}</li>
        @endforeach
    </ul>

    <h2>Próximos eventos</h2>
    @forelse ($proximosEventos as $evento)
        <div class="card">
            <a href="{{ route('eventos.show', $evento) }}">{{ $evento->titulo }}</a>
            — {{ $evento->data->format('d/m/Y') }} às {{ $evento->hora_inicio }}
        </div>
    @empty
        <p>Nenhum evento futuro agendado.</p>
    @endforelse

    @auth
        <p><a class="btn" href="{{ route('eventos.create') }}">+ Novo evento</a></p>
    @endauth
@endsection
