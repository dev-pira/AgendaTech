<?php

namespace App\Http\Controllers;

use App\Http\Requests\CadastroRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Views server-rendered (HTML puro, sem API) de autenticação.
 * Espelha as views home/cadastro/login/logout de core/views.py (Django).
 */
class AuthController extends Controller
{
    public function home()
    {
        return redirect()->route('comunidades.index');
    }

    public function mostrarCadastro()
    {
        if (Auth::check()) {
            return redirect()->route('comunidades.index');
        }

        return view('cadastro');
    }

    public function cadastro(CadastroRequest $request)
    {
        $dados = $request->validated();

        $user = User::create([
            'username' => $dados['username'],
            'email' => $dados['email'],
            'first_name' => $dados['first_name'],
            'last_name' => $dados['last_name'] ?? '',
            'password' => Hash::make($dados['password']),
        ]);

        Auth::login($user);

        return redirect()->route('comunidades.index')
            ->with('success', 'Cadastro realizado com sucesso. Bem-vindo(a)!');
    }

    public function mostrarLogin()
    {
        if (Auth::check()) {
            return redirect()->route('comunidades.index');
        }

        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credenciais = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credenciais)) {
            return back()
                ->withErrors(['username' => 'Usuário ou senha inválidos.'])
                ->onlyInput('username');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('comunidades.index'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
