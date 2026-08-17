<?php

namespace Tests\Feature\Api;

use App\Models\ComunidadeMembro;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Gestão de membros/organizadores — issue #53 (porte de
 * backend/src/{routes,controllers,services}/membros.* do Node, nunca
 * migrado junto com o resto da API na troca de stack).
 */
class MembroTest extends TestCase
{
    use CriaDados;

    public function test_listar_retorna_200_com_membros_da_comunidade(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->getJson("/api/comunidades/{$comunidade->id}/membros", $this->authHeader($organizador));

        $response->assertOk();
        $this->assertCount(2, $response->json('dados'));
    }

    public function test_listar_filtra_por_papel(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->getJson(
            "/api/comunidades/{$comunidade->id}/membros?papel=organizador",
            $this->authHeader($organizador)
        );

        $this->assertCount(1, $response->json('dados'));
        $this->assertEquals('organizador', $response->json('dados.0.papel'));
    }

    public function test_listar_sem_ser_organizador_recebe_403(): void
    {
        // Regressão da issue #75: index() vazava e-mail dos membros pra
        // qualquer usuário autenticado, sem checar se é organizador da
        // comunidade — diferente de store/updatePapel/destroy, que sempre
        // checaram. Um usuário sem nenhum vínculo com a comunidade não pode
        // ver a lista (nem sequer um membro comum, só organizador).
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $usuarioSemVinculo = $this->makeUser();

        $response = $this->getJson(
            "/api/comunidades/{$comunidade->id}/membros",
            $this->authHeader($usuarioSemVinculo)
        );

        $response->assertStatus(403);
    }

    public function test_listar_sem_autenticacao_retorna_401(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->getJson("/api/comunidades/{$comunidade->id}/membros");

        $response->assertStatus(401);
    }

    public function test_listar_comunidade_inexistente_retorna_404(): void
    {
        $organizador = $this->makeUser();

        $response = $this->getJson(
            '/api/comunidades/00000000-0000-0000-0000-000000000000/membros',
            $this->authHeader($organizador)
        );

        $response->assertStatus(404);
    }

    public function test_adicionar_organizador_adiciona_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $novoMembro = $this->makeUser(['email' => 'novo@example.com']);

        $response = $this->postJson(
            "/api/comunidades/{$comunidade->id}/membros",
            ['email' => 'novo@example.com', 'papel' => ComunidadeMembro::MEMBRO],
            $this->authHeader($organizador)
        );

        $response->assertStatus(201);
        $this->assertEquals($novoMembro->id, $response->json('usuario_id'));
        $this->assertDatabaseHas('comunidade_membros', [
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $novoMembro->id,
        ]);
    }

    public function test_adicionar_sem_ser_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);
        $novoMembro = $this->makeUser(['email' => 'novo@example.com']);

        $response = $this->postJson(
            "/api/comunidades/{$comunidade->id}/membros",
            ['email' => 'novo@example.com', 'papel' => ComunidadeMembro::MEMBRO],
            $this->authHeader($membro)
        );

        $response->assertStatus(403);
    }

    public function test_adicionar_email_sem_usuario_correspondente_retorna_404(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->postJson(
            "/api/comunidades/{$comunidade->id}/membros",
            ['email' => 'inexistente@example.com', 'papel' => ComunidadeMembro::MEMBRO],
            $this->authHeader($organizador)
        );

        $response->assertStatus(404);
    }

    public function test_adicionar_usuario_ja_membro_retorna_409(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser(['email' => 'membro@example.com']);
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->postJson(
            "/api/comunidades/{$comunidade->id}/membros",
            ['email' => 'membro@example.com', 'papel' => ComunidadeMembro::MEMBRO],
            $this->authHeader($organizador)
        );

        $response->assertStatus(409);
    }

    public function test_adicionar_sem_autenticacao_retorna_401(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->postJson("/api/comunidades/{$comunidade->id}/membros", [
            'email' => 'novo@example.com',
            'papel' => ComunidadeMembro::MEMBRO,
        ]);

        $response->assertStatus(401);
    }

    public function test_atualizar_papel_organizador_promove_membro_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->patchJson(
            "/api/comunidades/{$comunidade->id}/membros/{$membro->id}/papel",
            ['papel' => ComunidadeMembro::ORGANIZADOR],
            $this->authHeader($organizador)
        );

        $response->assertOk();
        $this->assertEquals('organizador', $response->json('papel'));
    }

    public function test_atualizar_papel_sem_ser_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->patchJson(
            "/api/comunidades/{$comunidade->id}/membros/{$membro->id}/papel",
            ['papel' => ComunidadeMembro::ORGANIZADOR],
            $this->authHeader($membro)
        );

        $response->assertStatus(403);
    }

    public function test_atualizar_papel_rebaixar_ultimo_organizador_retorna_422(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->patchJson(
            "/api/comunidades/{$comunidade->id}/membros/{$organizador->id}/papel",
            ['papel' => ComunidadeMembro::MEMBRO],
            $this->authHeader($organizador)
        );

        $response->assertStatus(422);
    }

    public function test_atualizar_papel_membro_nao_encontrado_retorna_404(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $outroUsuario = $this->makeUser();

        $response = $this->patchJson(
            "/api/comunidades/{$comunidade->id}/membros/{$outroUsuario->id}/papel",
            ['papel' => ComunidadeMembro::ORGANIZADOR],
            $this->authHeader($organizador)
        );

        $response->assertStatus(404);
    }

    public function test_remover_organizador_remove_membro_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->deleteJson(
            "/api/comunidades/{$comunidade->id}/membros/{$membro->id}",
            [],
            $this->authHeader($organizador)
        );

        $response->assertStatus(204);
        $this->assertDatabaseMissing('comunidade_membros', [
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $membro->id,
        ]);
    }

    public function test_remover_sem_ser_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro, ComunidadeMembro::MEMBRO, $organizador);

        $response = $this->deleteJson(
            "/api/comunidades/{$comunidade->id}/membros/{$membro->id}",
            [],
            $this->authHeader($membro)
        );

        $response->assertStatus(403);
    }

    public function test_remover_ultimo_organizador_retorna_422(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->deleteJson(
            "/api/comunidades/{$comunidade->id}/membros/{$organizador->id}",
            [],
            $this->authHeader($organizador)
        );

        $response->assertStatus(422);
        $this->assertDatabaseHas('comunidade_membros', [
            'comunidade_id' => $comunidade->id,
            'usuario_id' => $organizador->id,
        ]);
    }

    public function test_remover_membro_nao_encontrado_retorna_404(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $outroUsuario = $this->makeUser();

        $response = $this->deleteJson(
            "/api/comunidades/{$comunidade->id}/membros/{$outroUsuario->id}",
            [],
            $this->authHeader($organizador)
        );

        $response->assertStatus(404);
    }
}
