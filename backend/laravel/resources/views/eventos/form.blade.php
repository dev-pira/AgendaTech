@extends('layouts.app')

@section('title', $modo === 'criar' ? 'Novo evento' : 'Editar evento')

@section('content')
    <h1>{{ $modo === 'criar' ? 'Novo evento' : 'Editar evento' }}</h1>

    <form method="POST" action="{{ $modo === 'criar' ? route('eventos.store') : route('eventos.update', $evento) }}">
        @csrf
        @if ($modo === 'editar')
            @method('PUT')
        @endif

        <label for="titulo">Título</label>
        <input type="text" id="titulo" name="titulo" value="{{ old('titulo', $evento->titulo ?? '') }}" required>

        <label for="descricao">Descrição</label>
        <textarea id="descricao" name="descricao" rows="4" required>{{ old('descricao', $evento->descricao ?? '') }}</textarea>

        <label for="data">Data</label>
        <input type="date" id="data" name="data" value="{{ old('data', isset($evento) ? $evento->data->toDateString() : '') }}" required>

        <label for="hora_inicio">Hora de início</label>
        <input type="time" id="hora_inicio" name="hora_inicio" value="{{ old('hora_inicio', $evento->hora_inicio ?? '') }}" required>

        <label for="hora_fim">Hora de fim (opcional)</label>
        <input type="time" id="hora_fim" name="hora_fim" value="{{ old('hora_fim', $evento->hora_fim ?? '') }}">

        <label for="local">Local</label>
        <input type="text" id="local" name="local" value="{{ old('local', $evento->local ?? '') }}" required>

        <label for="tipo">Tipo</label>
        <select id="tipo" name="tipo" required>
            @foreach (['presencial' => 'Presencial', 'online' => 'Online', 'hibrido' => 'Híbrido'] as $valor => $label)
                <option value="{{ $valor }}" @selected(old('tipo', $evento->tipo ?? 'presencial') === $valor)>{{ $label }}</option>
            @endforeach
        </select>

        <label for="url_online">URL online (obrigatório se online ou híbrido)</label>
        <input type="text" id="url_online" name="url_online" value="{{ old('url_online', $evento->url_online ?? '') }}">

        @if ($modo === 'criar')
            <label for="comunidade_id">Comunidade</label>
            <select id="comunidade_id" name="comunidade_id" required>
                @foreach ($comunidades as $c)
                    <option value="{{ $c->id }}">{{ $c->nome }}</option>
                @endforeach
            </select>
        @endif

        <button type="submit">Salvar</button>
    </form>
@endsection
