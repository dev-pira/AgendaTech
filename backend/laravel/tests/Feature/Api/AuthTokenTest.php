<?php

namespace Tests\Feature\Api;

use Firebase\JWT\JWT;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Autenticação via JWT (App\Support\JwtService) — issue #52. Antes
 * (Bearer token opaco em tabela) não dava pra testar expiração porque
 * o token nem expirava; ver docs/test-plan.md, gap 4 (agora fechado).
 */
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

    public function test_token_retornado_e_valido_para_o_usuario_correto(): void
    {
        $user = $this->makeUser(['username' => 'joao', 'password' => bcrypt('StrongPass123!')]);

        $response = $this->postJson('/api/auth/token', [
            'username' => 'joao',
            'password' => 'StrongPass123!',
        ]);

        $token = $response->json('token');

        // Usa o token retornado numa rota protegida de verdade, em vez
        // de decodificar manualmente — cobre o ciclo completo emissão
        // -> verificação.
        $comunidadeResponse = $this->postJson('/api/comunidades', [
            'nome' => 'Comunidade via token',
            'descricao' => 'Descrição válida com mais de dez caracteres.',
            'cidade' => 'Limeira',
            'contato' => 'contato@example.com',
        ], ['Authorization' => "Bearer {$token}"]);

        $comunidadeResponse->assertStatus(201);
        $this->assertEquals($user->id, $comunidadeResponse->json('criado_por.id'));
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

    public function test_token_expirado_retorna_401(): void
    {
        $user = $this->makeUser();
        $expirado = JWT::encode(
            ['sub' => $user->id, 'iat' => time() - 7200, 'exp' => time() - 3600],
            config('jwt.secret'),
            config('jwt.algo')
        );

        $response = $this->postJson('/api/comunidades', [
            'nome' => 'X', 'descricao' => 'Y', 'cidade' => 'Z', 'contato' => 'a@a.com',
        ], ['Authorization' => "Bearer {$expirado}"]);

        $response->assertStatus(401);
    }

    public function test_token_com_assinatura_invalida_retorna_401(): void
    {
        $user = $this->makeUser();
        $assinadoComOutraChave = JWT::encode(
            ['sub' => $user->id, 'iat' => time(), 'exp' => time() + 3600],
            'chave-errada-de-proposito-mas-com-tamanho-minimo-exigido-pelo-hs256',
            config('jwt.algo')
        );

        $response = $this->postJson('/api/comunidades', [
            'nome' => 'X', 'descricao' => 'Y', 'cidade' => 'Z', 'contato' => 'a@a.com',
        ], ['Authorization' => "Bearer {$assinadoComOutraChave}"]);

        $response->assertStatus(401);
    }

    public function test_token_malformado_retorna_401(): void
    {
        $response = $this->postJson('/api/comunidades', [
            'nome' => 'X', 'descricao' => 'Y', 'cidade' => 'Z', 'contato' => 'a@a.com',
        ], ['Authorization' => 'Bearer isso-nao-e-um-jwt']);

        $response->assertStatus(401);
    }

    public function test_token_de_usuario_que_nao_existe_mais_retorna_401(): void
    {
        $user = $this->makeUser();
        $token = JWT::encode(
            ['sub' => $user->id, 'iat' => time(), 'exp' => time() + 3600],
            config('jwt.secret'),
            config('jwt.algo')
        );
        $user->delete();

        $response = $this->postJson('/api/comunidades', [
            'nome' => 'X', 'descricao' => 'Y', 'cidade' => 'Z', 'contato' => 'a@a.com',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertStatus(401);
    }
}
