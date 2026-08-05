@extends('layouts.app')

@section('title', 'Excluir comunidade')

@section('content')
    <h1>Excluir comunidade</h1>
    <p>Tem certeza que deseja excluir a comunidade <strong>{{ $comunidade->nome }}</strong>? Essa ação não pode ser desfeita.</p>

    <form method="POST" action="{{ route('comunidades.destroy', $comunidade) }}">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn-danger">Confirmar exclusão</button>
        <a class="btn" href="{{ route('comunidades.show', $comunidade) }}">Cancelar</a>
    </form>
@endsection
