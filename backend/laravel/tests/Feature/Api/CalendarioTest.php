<?php

namespace Tests\Feature\Api;

use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Endpoint agregador de calendário compartilhado — issue #54 (porte de
 * backend/src/controllers/calendario.controller.js do Node, nunca
 * migrado junto com o resto da API na troca de stack).
 */
class CalendarioTest extends TestCase
{
    use CriaDados;

    public function test_sem_data_inicio_retorna_422(): void
    {
        $response = $this->getJson('/api/calendario?data_fim=2026-09-30');

        $response->assertStatus(422);
    }

    public function test_sem_data_fim_retorna_422(): void
    {
        $response = $this->getJson('/api/calendario?data_inicio=2026-09-01');

        $response->assertStatus(422);
    }

    public function test_data_fim_antes_de_data_inicio_retorna_422(): void
    {
        $response = $this->getJson('/api/calendario?data_inicio=2026-09-30&data_fim=2026-09-01');

        $response->assertStatus(422);
    }

    public function test_retorna_200_com_envelope_eventos_total_periodo(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['data' => '2026-09-10']);
        $this->makeEvento($comunidade, $organizador, ['data' => '2026-09-15', 'titulo' => 'Segundo evento do periodo']);

        $response = $this->getJson('/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30');

        $response->assertOk();
        $this->assertCount(2, $response->json('eventos'));
        $this->assertEquals(2, $response->json('total'));
        $this->assertEquals('2026-09-01', $response->json('periodo.data_inicio'));
        $this->assertEquals('2026-09-30', $response->json('periodo.data_fim'));
    }

    public function test_nao_retorna_eventos_fora_do_periodo(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['data' => '2026-10-05']);

        $response = $this->getJson('/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30');

        $this->assertCount(0, $response->json('eventos'));
    }

    public function test_filtra_por_comunidade_id(): void
    {
        $organizador = $this->makeUser();
        $comunidadeA = $this->makeComunidade($organizador, ['nome' => 'ComunidadeA']);
        $comunidadeB = $this->makeComunidade($organizador, ['nome' => 'ComunidadeB']);
        $this->makeEvento($comunidadeA, $organizador, ['data' => '2026-09-10']);
        $this->makeEvento($comunidadeB, $organizador, ['data' => '2026-09-12', 'titulo' => 'Evento da comunidade B']);

        $response = $this->getJson("/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30&comunidade_id={$comunidadeA->id}");

        $this->assertCount(1, $response->json('eventos'));
        $this->assertEquals($comunidadeA->id, $response->json('eventos.0.comunidade.id'));
    }

    public function test_filtra_por_cidade(): void
    {
        $organizador = $this->makeUser();
        $comunidadeLimeira = $this->makeComunidade($organizador, ['nome' => 'DevLimeira', 'cidade' => 'Limeira']);
        $comunidadePiracicaba = $this->makeComunidade($organizador, ['nome' => 'DEVPIRA', 'cidade' => 'Piracicaba']);
        $this->makeEvento($comunidadeLimeira, $organizador, ['data' => '2026-09-10']);
        $this->makeEvento($comunidadePiracicaba, $organizador, ['data' => '2026-09-12', 'titulo' => 'Evento em Piracicaba']);

        $response = $this->getJson('/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30&cidade=Limeira');

        $this->assertCount(1, $response->json('eventos'));
    }

    public function test_filtra_por_tipo(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['data' => '2026-09-10', 'tipo' => 'online', 'url_online' => 'https://example.com']);
        $this->makeEvento($comunidade, $organizador, ['data' => '2026-09-12', 'titulo' => 'Evento presencial', 'tipo' => 'presencial']);

        $response = $this->getJson('/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30&tipo=online');

        $this->assertCount(1, $response->json('eventos'));
        $this->assertEquals('online', $response->json('eventos.0.tipo'));
    }

    public function test_endpoint_e_publico_sem_autenticacao(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['data' => '2026-09-10']);

        $response = $this->getJson('/api/calendario?data_inicio=2026-09-01&data_fim=2026-09-30');

        $response->assertOk();
    }
}
