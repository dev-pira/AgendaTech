@extends('layouts.app')

@section('title', 'Excluir evento')

@section('content')
    <h1>Excluir evento</h1>
    <p>Tem certeza que deseja excluir o evento <strong>{{ $evento->titulo }}</strong>? Essa ação não pode ser desfeita.</p>

    <form method="POST" action="{{ route('eventos.destroy', $evento) }}">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn-danger">Confirmar exclusão</button>
        <a class="btn" href="{{ route('eventos.show', $evento) }}">Cancelar</a>
    </form>
@endsection
