@extends('layouts.app')

@section('title', $evento->titulo)

@section('content')
    <h1>{{ $evento->titulo }}</h1>
    <p><strong>Comunidade:</strong> <a href="{{ route('comunidades.show', $evento->comunidade) }}">{{ $evento->comunidade->nome }}</a></p>
    <p><strong>Data:</strong> {{ $evento->data->format('d/m/Y') }} — {{ $evento->hora_inicio }}@if($evento->hora_fim) até {{ $evento->hora_fim }} @endif</p>
    <p><strong>Local:</strong> {{ $evento->local }}</p>
    <p><strong>Tipo:</strong> {{ $evento->tipo }}</p>
    @if ($evento->url_online)
        <p><strong>URL online:</strong> <a href="{{ $evento->url_online }}">{{ $evento->url_online }}</a></p>
    @endif
    <p>{{ $evento->descricao }}</p>
    <p><strong>Organizador:</strong> {{ $evento->organizador->nomeExibicao() }}</p>

    @if ($podeGerenciar)
        <p>
            <a class="btn" href="{{ route('eventos.edit', $evento) }}">Editar</a>
            <a class="btn btn-danger" href="{{ route('eventos.confirm-delete', $evento) }}">Excluir</a>
        </p>
    @endif
@endsection
