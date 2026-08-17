<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Cadastro via API (POST /api/cadastro) — issue #73. Reusa a mesma
 * CadastroRequest do cadastro web (App\Http\Controllers\AuthController::
 * cadastro), só muda o formato da resposta (JSON com token, não redirect).
 */
class CadastroTest extends TestCase
{
    use CriaDados;

    private function dadosValidos(array $overrides = []): array
    {
        return [
            'username' => 'joaosilva',
            'email' => 'joao@example.com',
            'first_name' => 'João',
            'last_name' => 'Silva',
            'password' => 'SenhaForte123!',
            'password_confirmation' => 'SenhaForte123!',
            ...$overrides,
        ];
    }

    public function test_dados_validos_cria_usuario_e_retorna_token(): void
    {
        $response = $this->postJson('/api/cadastro', $this->dadosValidos());

        $response->assertStatus(201)->assertJsonStructure(['token', 'usuario' => ['id', 'nome', 'email']]);
        $this->assertEquals('João Silva', $response->json('usuario.nome'));
        $this->assertEquals('joao@example.com', $response->json('usuario.email'));
        $this->assertDatabaseHas('users', ['username' => 'joaosilva', 'email' => 'joao@example.com']);
    }

    public function test_senha_e_gravada_com_hash_nao_em_texto_puro(): void
    {
        $this->postJson('/api/cadastro', $this->dadosValidos());

        $user = User::where('username', 'joaosilva')->firstOrFail();
        $this->assertNotEquals('SenhaForte123!', $user->password);
        $this->assertTrue(Hash::check('SenhaForte123!', $user->password));
    }

    public function test_token_retornado_e_valido_para_o_usuario_recem_criado(): void
    {
        $response = $this->postJson('/api/cadastro', $this->dadosValidos());
        $token = $response->json('token');

        $comunidadeResponse = $this->postJson('/api/comunidades', [
            'nome' => 'Comunidade via cadastro',
            'descricao' => 'Descrição válida com mais de dez caracteres.',
            'cidade' => 'Limeira',
            'contato' => 'contato@example.com',
        ], ['Authorization' => "Bearer {$token}"]);

        $comunidadeResponse->assertStatus(201);
    }

    public function test_username_duplicado_retorna_422(): void
    {
        $this->makeUser(['username' => 'joaosilva']);

        $response = $this->postJson('/api/cadastro', $this->dadosValidos());

        $response->assertStatus(422);
    }

    public function test_email_duplicado_retorna_422(): void
    {
        $this->makeUser(['email' => 'joao@example.com']);

        $response = $this->postJson('/api/cadastro', $this->dadosValidos(['username' => 'outrousername']));

        $response->assertStatus(422);
    }

    public function test_senha_curta_retorna_422(): void
    {
        $response = $this->postJson('/api/cadastro', $this->dadosValidos([
            'password' => '123',
            'password_confirmation' => '123',
        ]));

        $response->assertStatus(422);
    }

    public function test_confirmacao_de_senha_diferente_retorna_422(): void
    {
        $response = $this->postJson('/api/cadastro', $this->dadosValidos([
            'password_confirmation' => 'outra-senha-diferente',
        ]));

        $response->assertStatus(422);
    }

    public function test_campos_obrigatorios_ausentes_retorna_422(): void
    {
        $response = $this->postJson('/api/cadastro', []);

        $response->assertStatus(422);
    }

    public function test_last_name_e_opcional(): void
    {
        $dados = $this->dadosValidos();
        unset($dados['last_name']);

        $response = $this->postJson('/api/cadastro', $dados);

        $response->assertStatus(201);
        $this->assertEquals('João', $response->json('usuario.nome'));
    }
}
