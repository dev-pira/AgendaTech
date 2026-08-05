@extends('layouts.app')

@section('title', $modo === 'criar' ? 'Nova comunidade' : 'Editar comunidade')

@section('content')
    <h1>{{ $modo === 'criar' ? 'Nova comunidade' : 'Editar comunidade' }}</h1>

    <form method="POST" action="{{ $modo === 'criar' ? route('comunidades.store') : route('comunidades.update', $comunidade) }}">
        @csrf
        @if ($modo === 'editar')
            @method('PUT')
        @endif

        <label for="nome">Nome</label>
        <input type="text" id="nome" name="nome" value="{{ old('nome', $comunidade->nome ?? '') }}" required>

        <label for="descricao">Descrição</label>
        <textarea id="descricao" name="descricao" rows="4" required>{{ old('descricao', $comunidade->descricao ?? '') }}</textarea>

        <label for="cidade">Cidade</label>
        <input type="text" id="cidade" name="cidade" value="{{ old('cidade', $comunidade->cidade ?? '') }}" required>

        <label for="contato">Contato (e-mail ou URL)</label>
        <input type="text" id="contato" name="contato" value="{{ old('contato', $comunidade->contato ?? '') }}" required>

        <label for="logo_url">URL da logo (opcional)</label>
        <input type="text" id="logo_url" name="logo_url" value="{{ old('logo_url', $comunidade->logo_url ?? '') }}">

        <button type="submit">Salvar</button>
    </form>
@endsection
