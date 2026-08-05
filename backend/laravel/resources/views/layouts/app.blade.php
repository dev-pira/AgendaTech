<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Agenda Tech')</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 1rem; color: #222; }
        nav { display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 1rem; margin-bottom: 1.5rem; }
        nav a { text-decoration: none; color: #2563eb; }
        nav form { margin-left: auto; }
        .msg { padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
        .msg-success { background: #dcfce7; color: #166534; }
        .msg-error { background: #fee2e2; color: #991b1b; }
        .errors { background: #fee2e2; color: #991b1b; padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        label { display: block; margin-top: .75rem; font-weight: 600; }
        input, select, textarea { width: 100%; padding: .5rem; margin-top: .25rem; box-sizing: border-box; }
        button, .btn { display: inline-block; margin-top: 1rem; padding: .5rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; }
        .btn-danger { background: #dc2626; }
        .pagination { display: flex; gap: .5rem; margin-top: 1rem; }
    </style>
</head>
<body>
<nav>
    <a href="{{ route('comunidades.index') }}">Comunidades</a>
    <a href="{{ route('eventos.index') }}">Eventos</a>
    @auth
        <span>Olá, {{ Auth::user()->nomeExibicao() }}</span>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">Sair</button>
        </form>
    @else
        <a href="{{ route('login') }}">Login</a>
        <a href="{{ route('cadastro') }}" style="margin-left: auto;">Cadastro</a>
    @endauth
</nav>

@if (session('success'))
    <div class="msg msg-success">{{ session('success') }}</div>
@endif
@if (session('error'))
    <div class="msg msg-error">{{ session('error') }}</div>
@endif
@if ($errors->any())
    <div class="errors">
        <ul style="margin: 0; padding-left: 1.25rem;">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

@yield('content')
</body>
</html>
