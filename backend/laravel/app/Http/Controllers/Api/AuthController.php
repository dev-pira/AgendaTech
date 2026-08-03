<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Token;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Autenticação: Bearer token simples (ver model Token). Para obter um
 * token, use POST /api/auth/token com username/password de um usuário
 * já criado (via cadastro ou seeder). Espelha core/api.py (Django).
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
        $token = Token::firstOrCreate(['user_id' => $user->id]);

        return response()->json(['token' => $token->key]);
    }
}
