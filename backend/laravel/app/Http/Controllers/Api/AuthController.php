<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        return response()->json(['token' => JwtService::encode($user)]);
    }
}
