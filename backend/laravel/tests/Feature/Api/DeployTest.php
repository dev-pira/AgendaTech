<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

/**
 * Gatilho de deploy via HTTP - substitui SSH no GitHub Actions. Ver
 * App\Http\Controllers\Api\DeployController e docs/deploy.md.
 */
class DeployTest extends TestCase
{
    public function test_sem_segredo_configurado_retorna_403(): void
    {
        config(['services.deploy.secret' => null]);

        $response = $this->postJson('/api/internal/deploy', [], [
            'X-Deploy-Secret' => 'qualquer-coisa',
        ]);

        $response->assertStatus(403);
    }

    public function test_segredo_errado_retorna_403(): void
    {
        config(['services.deploy.secret' => 'segredo-correto']);

        $response = $this->postJson('/api/internal/deploy', [], [
            'X-Deploy-Secret' => 'segredo-errado',
        ]);

        $response->assertStatus(403);
    }

    public function test_sem_header_retorna_403(): void
    {
        config(['services.deploy.secret' => 'segredo-correto']);

        $response = $this->postJson('/api/internal/deploy');

        $response->assertStatus(403);
    }

    public function test_segredo_correto_retorna_200(): void
    {
        config(['services.deploy.secret' => 'segredo-correto']);

        $response = $this->postJson('/api/internal/deploy', [], [
            'X-Deploy-Secret' => 'segredo-correto',
        ]);

        $response->assertOk()->assertJsonStructure(['ok', 'saida']);
    }
}
