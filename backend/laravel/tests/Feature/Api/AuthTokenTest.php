<?php

namespace Tests\Feature\Api;

use App\Models\Token;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class AuthTokenTest extends TestCase
{
    use CriaDados;

    public function test_credenciais_validas_retorna_200_com_token(): void
    {
        $this->makeUser(['username' => 'joao', 'password' => bcrypt('StrongPass123!')]);

        $response = $this->postJson('/api/auth/token', [
            'username' => 'joao',
            'password' => 'StrongPass123!',
        ]);

        $response->assertOk()->assertJsonStructure(['token']);
    }

    public function test_token_retornado_e_persistido(): void
    {
        $user = $this->makeUser(['username' => 'joao', 'password' => bcrypt('StrongPass123!')]);

        $response = $this->postJson('/api/auth/token', [
            'username' => 'joao',
            'password' => 'StrongPass123!',
        ]);

        $token = Token::where('user_id', $user->id)->firstOrFail();
        $this->assertEquals($token->key, $response->json('token'));
    }

    public function test_senha_invalida_retorna_401(): void
    {
        $this->makeUser(['username' => 'joao', 'password' => bcrypt('StrongPass123!')]);

        $response = $this->postJson('/api/auth/token', [
            'username' => 'joao',
            'password' => 'senha-errada',
        ]);

        $response->assertStatus(401);
    }
}
