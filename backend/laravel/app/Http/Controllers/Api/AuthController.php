<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CadastroRequest;
use App\Models\User;
use App\Support\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Autenticação: JWT assinado (ver App\Support\JwtService), stateless —
 * sem tabela de tokens. Para obter um token, use POST /api/auth/token
 * com username/password de um usuário já criado (via cadastro ou
 * seeder). Espelha backend/src/services/auth.service.js (Node) e
 * core/api.py (Django). Substitui o Bearer token opaco anterior
 * (tabela `tokens`, removida — ver issue #52).
 */
class AuthController extends Controller
{
    public function obterToken(Request $request)
    {
        $credenciais = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::once(['username' => $credenciais['username'], 'password' => $credenciais['password']])) {
            abort(401, 'Credenciais inválidas.');
        }

        /** @var User $user */
        $user = Auth::user();

        return response()->json($this->respostaComToken($user));
    }

    // Reusa a mesma CadastroRequest do cadastro web (App\Http\Controllers\
    // AuthController::cadastro) - a validacao ja e identica pro que a API
    // precisa, so muda o formato da resposta (JSON com token, nao redirect
    // com sessao). Ver issue #73: antes so existia via Blade, o frontend
    // React nao tinha como se cadastrar sozinho.
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

        // Loga o usuario automaticamente (mesma resposta de POST
        // /auth/token) - nao faz sentido pedir login de novo logo apos o
        // cadastro.
        return response()->json($this->respostaComToken($user), 201);
    }

    // Inclui dados basicos do usuario na propria resposta (nao so o
    // token) - o frontend nao tem outro jeito de saber quem logou, ja que
    // o JWT so carrega o "sub" (id) e nao existe (ainda) um endpoint tipo
    // GET /auth/eu pra consultar depois. Ver issue #93.
    private function respostaComToken(User $user): array
    {
        return [
            'token' => JwtService::encode($user),
            'usuario' => [
                'id' => $user->id,
                'nome' => trim("{$user->first_name} {$user->last_name}") ?: $user->username,
                'email' => $user->email,
            ],
        ];
    }
}
