<?php

namespace Tests\Feature\Api;

use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Tarefa 2.4 (Validações, docs/wbs.md): toda resposta de erro da API segue
 * o envelope { "error": { "code": "...", "message": "..." } }. Ver
 * App\Support\ApiErrorResponder.
 */
class ErrorEnvelopeTest extends TestCase
{
    use CriaDados;

    public function test_recurso_inexistente_retorna_envelope_not_found(): void
    {
        $response = $this->getJson('/api/comunidades/'.fake()->uuid());

        $response->assertStatus(404);
        $response->assertJsonStructure(['error' => ['code', 'message']]);
        $this->assertEquals('NOT_FOUND', $response->json('error.code'));
    }

    public function test_requisicao_sem_autenticacao_retorna_envelope_unauthenticated(): void
    {
        $response = $this->postJson('/api/comunidades', []);

        $response->assertStatus(401);
        $response->assertJsonStructure(['error' => ['code', 'message']]);
        $this->assertEquals('UNAUTHENTICATED', $response->json('error.code'));
    }

    public function test_campo_obrigatorio_ausente_retorna_envelope_validation_error_com_fields(): void
    {
        $organizador = $this->makeUser();

        $response = $this->postJson('/api/comunidades', [], $this->authHeader($organizador));

        $response->assertStatus(422);
        $response->assertJsonStructure(['error' => ['code', 'message', 'fields']]);
        $this->assertEquals('VALIDATION_ERROR', $response->json('error.code'));
        $this->assertArrayHasKey('nome', $response->json('error.fields'));
    }

    public function test_nome_duplicado_retorna_envelope_conflict(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira']);

        $response = $this->postJson('/api/comunidades', [
            'nome' => 'DevLimeira',
            'descricao' => 'Comunidade de tecnologia de Limeira e região.',
            'cidade' => 'Limeira',
            'contato' => 'contato@devlimeira.dev',
        ], $this->authHeader($organizador));

        $response->assertStatus(409);
        $response->assertJsonStructure(['error' => ['code', 'message']]);
        $this->assertEquals('CONFLICT', $response->json('error.code'));
    }

    public function test_acao_sem_permissao_retorna_envelope_forbidden(): void
    {
        $organizador = $this->makeUser();
        $outroUsuario = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->putJson("/api/comunidades/{$comunidade->id}", [
            'nome' => 'Novo nome',
        ], $this->authHeader($outroUsuario));

        $response->assertStatus(403);
        $response->assertJsonStructure(['error' => ['code', 'message']]);
        $this->assertEquals('FORBIDDEN', $response->json('error.code'));
    }
}
