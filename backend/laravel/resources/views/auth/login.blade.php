@extends('layouts.app')

@section('title', 'Login')

@section('content')
    <h1>Login</h1>
    <form method="POST" action="{{ route('login.store') }}">
        @csrf
        <label for="username">Usuário</label>
        <input type="text" id="username" name="username" value="{{ old('username') }}" required autofocus>

        <label for="password">Senha</label>
        <input type="password" id="password" name="password" required>

        <button type="submit">Entrar</button>
    </form>
    <p style="margin-top: 1rem;">Ainda não tem conta? <a href="{{ route('cadastro') }}">Cadastre-se</a>.</p>
@endsection
