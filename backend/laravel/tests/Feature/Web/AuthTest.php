<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use CriaDados;

    private function payloadCadastro(array $overrides = []): array
    {
        return [
            'username' => 'novousuario',
            'email' => 'novo@example.com',
            'first_name' => 'Nova',
            'last_name' => 'Usuária',
            'password' => 'SenhaForte123!',
            'password_confirmation' => 'SenhaForte123!',
            ...$overrides,
        ];
    }

    public function test_cadastro_get_retorna_200(): void
    {
        $this->get('/cadastro')->assertOk();
    }

    public function test_cadastro_post_valido_cria_usuario_e_loga(): void
    {
        $response = $this->post('/cadastro', $this->payloadCadastro());

        $this->assertTrue(User::where('username', 'novousuario')->exists());
        $response->assertRedirect('/comunidades');
        $this->assertAuthenticated();
    }

    public function test_cadastro_senhas_diferentes_nao_cria_usuario(): void
    {
        $this->post('/cadastro', $this->payloadCadastro(['password_confirmation' => 'OutraSenha456!']));

        $this->assertFalse(User::where('username', 'novousuario')->exists());
    }

    public function test_cadastro_usuario_ja_autenticado_e_redirecionado(): void
    {
        $user = $this->makeUser();

        $response = $this->actingAs($user)->get('/cadastro');

        $response->assertRedirect('/comunidades');
    }

    public function test_login_get_retorna_200(): void
    {
        $this->get('/login')->assertOk();
    }

    public function test_login_credenciais_validas_autentica(): void
    {
        $this->makeUser(['username' => 'joana', 'password' => bcrypt('SenhaForte123!')]);

        $response = $this->post('/login', ['username' => 'joana', 'password' => 'SenhaForte123!']);

        $response->assertRedirect('/comunidades');
        $this->assertAuthenticated();
    }

    public function test_login_credenciais_invalidas_nao_autentica(): void
    {
        $this->makeUser(['username' => 'joana', 'password' => bcrypt('SenhaForte123!')]);

        $this->post('/login', ['username' => 'joana', 'password' => 'errada']);

        $this->assertGuest();
    }

    public function test_logout_desautentica_usuario(): void
    {
        $user = $this->makeUser();

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();

        $this->get('/comunidades/nova')->assertRedirect('/login');
    }
}
