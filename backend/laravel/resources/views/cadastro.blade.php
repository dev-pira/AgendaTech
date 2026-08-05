@extends('layouts.app')

@section('title', 'Cadastro')

@section('content')
    <h1>Criar conta</h1>
    <form method="POST" action="{{ route('cadastro.store') }}">
        @csrf
        <label for="username">Usuário</label>
        <input type="text" id="username" name="username" value="{{ old('username') }}" required autofocus>

        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" value="{{ old('email') }}" required>

        <label for="first_name">Nome</label>
        <input type="text" id="first_name" name="first_name" value="{{ old('first_name') }}" required>

        <label for="last_name">Sobrenome</label>
        <input type="text" id="last_name" name="last_name" value="{{ old('last_name') }}">

        <label for="password">Senha</label>
        <input type="password" id="password" name="password" required>

        <label for="password_confirmation">Confirme a senha</label>
        <input type="password" id="password_confirmation" name="password_confirmation" required>

        <button type="submit">Cadastrar</button>
    </form>
@endsection
