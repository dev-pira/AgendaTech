<?php

namespace Tests\Concerns;

use App\Models\Comunidade;
use App\Models\ComunidadeMembro;
use App\Models\Evento;
use App\Models\Token;
use App\Models\User;

/**
 * Helpers de fixture usados pelos testes de Feature/Unit — espelha
 * core/tests/helpers.py (Django).
 */
trait CriaDados
{
    protected function makeUser(array $overrides = []): User
    {
        return User::factory()->create($overrides);
    }

    protected function authHeader(User $user): array
    {
        $token = Token::firstOrCreate(['user_id' => $user->id]);

        return ['Authorization' => 'Bearer '.$token->key];
    }

    protected function makeComunidade(User $criador, array $overrides = []): Comunidade
    {
        $comunidade = Comunidade::factory()->create([
            ...$overrides,
            'criado_por_id' => $criador->id,
        ]);

        ComunidadeMembro::create([
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $criador->id,
            'papel' => ComunidadeMembro::ORGANIZADOR,
            'adicionado_por_id' => $criador->id,
        ]);

        return $comunidade;
    }

    protected function addMembro(
        Comunidade $comunidade,
        User $usuario,
        string $papel = ComunidadeMembro::MEMBRO,
        ?User $adicionadoPor = null
    ): ComunidadeMembro {
        return ComunidadeMembro::create([
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $usuario->id,
            'papel' => $papel,
            'adicionado_por_id' => $adicionadoPor?->id,
        ]);
    }

    protected function makeEvento(Comunidade $comunidade, User $organizador, array $overrides = []): Evento
    {
        return Evento::factory()->create([
            ...$overrides,
            'comunidade_id' => $comunidade->id,
            'organizador_id' => $organizador->id,
        ]);
    }
}
