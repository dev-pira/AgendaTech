<?php

namespace Tests\Feature\Api;

use App\Models\Comunidade;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class ComunidadeTest extends TestCase
{
    use CriaDados;

    public function test_listar_retorna_200_com_envelope_de_paginacao(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira']);

        $response = $this->getJson('/api/comunidades');

        $response->assertOk();
        $this->assertCount(2, $response->json('dados'));
        $this->assertEquals(2, $response->json('paginacao.total_itens'));
    }

    public function test_listar_filtra_por_cidade(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA', 'cidade' => 'Piracicaba']);
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira', 'cidade' => 'Limeira']);

        $response = $this->getJson('/api/comunidades?cidade=Limeira');

        $this->assertCount(1, $response->json('dados'));
        $this->assertEquals('DevLimeira', $response->json('dados.0.nome'));
    }

    public function test_listar_filtra_por_busca_no_nome_case_insensitive_e_parcial(): void
    {
        // Issue #92: a view Blade tinha esse filtro desde sempre, nunca
        // foi portado pra API - React ficava filtrando so a pagina atual
        // (nao o banco inteiro). Achado comparando as duas telas.
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira']);
        $this->makeComunidade($organizador, ['nome' => 'AWS User Group']);

        $response = $this->getJson('/api/comunidades?busca=dev');

        $this->assertCount(2, $response->json('dados'));
    }

    public function test_listar_pagina_negativa_retorna_400(): void
    {
        $response = $this->getJson('/api/comunidades?pagina=-1');

        $response->assertStatus(400);
    }

    public function test_listar_total_membros_incluido_na_resposta(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->addMembro($comunidade, $this->makeUser());

        $response = $this->getJson('/api/comunidades');

        $this->assertEquals(2, $response->json('dados.0.total_membros'));
    }

    public function test_eventos_da_comunidade_retorna_200_com_envelope_de_paginacao(): void
    {
        // Regressão: PaginaResultados::paginar() era tipado com a classe
        // concreta Builder, mas $comunidade->eventos()->with(...) devolve
        // a relação (HasMany), não um Builder — TypeError em runtime,
        // nunca pego porque esse endpoint não tinha teste. Ver PaginaResultados.
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador);

        $response = $this->getJson("/api/comunidades/{$comunidade->id}/eventos");

        $response->assertOk();
        $this->assertCount(1, $response->json('dados'));
        $this->assertEquals(1, $response->json('paginacao.total_itens'));
    }

    public function test_obter_retorna_200_com_dados_completos(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);

        $response = $this->getJson("/api/comunidades/{$comunidade->id}");

        $response->assertOk();
        $this->assertEquals('DEVPIRA', $response->json('nome'));
        $this->assertCount(1, $response->json('membros'));
        $this->assertEquals('organizador', $response->json('membros.0.papel'));
    }

    public function test_obter_id_inexistente_retorna_404(): void
    {
        $response = $this->getJson('/api/comunidades/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404);
    }

    public function test_criar_sem_autenticacao_retorna_401(): void
    {
        $response = $this->postJson('/api/comunidades', $this->payloadComunidade());

        $response->assertStatus(401);
    }

    public function test_criar_com_sucesso_e_retorna_201(): void
    {
        $organizador = $this->makeUser();

        $response = $this->postJson('/api/comunidades', $this->payloadComunidade(), $this->authHeader($organizador));

        $response->assertStatus(201);
        $this->assertTrue(Comunidade::where('nome', 'DevCity')->exists());
    }

    public function test_criador_vira_organizador_automaticamente(): void
    {
        $organizador = $this->makeUser();

        $response = $this->postJson('/api/comunidades', $this->payloadComunidade(), $this->authHeader($organizador));

        $this->assertEquals('organizador', $response->json('membros.0.papel'));
    }

    public function test_criar_nome_ausente_retorna_400_ou_422(): void
    {
        $organizador = $this->makeUser();
        $payload = $this->payloadComunidade();
        unset($payload['nome']);

        $response = $this->postJson('/api/comunidades', $payload, $this->authHeader($organizador));

        $this->assertContains($response->status(), [400, 422]);
    }

    public function test_criar_descricao_acima_de_1000_caracteres_retorna_422(): void
    {
        $organizador = $this->makeUser();
        $payload = $this->payloadComunidade();
        $payload['descricao'] = str_repeat('a', 1001);

        $response = $this->postJson('/api/comunidades', $payload, $this->authHeader($organizador));

        $response->assertStatus(422);
        $this->assertEquals('VALIDATION_ERROR', $response->json('error.code'));
        $this->assertArrayHasKey('descricao', $response->json('error.fields'));
    }

    public function test_criar_nome_duplicado_retorna_409(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DevCity']);

        $response = $this->postJson('/api/comunidades', $this->payloadComunidade(), $this->authHeader($organizador));

        $response->assertStatus(409);
    }

    public function test_atualizar_organizador_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);

        $response = $this->putJson(
            "/api/comunidades/{$comunidade->id}",
            ['nome' => 'DEVPIRA - Piracicaba'],
            $this->authHeader($organizador)
        );

        $response->assertOk();
        $this->assertEquals('DEVPIRA - Piracicaba', $comunidade->fresh()->nome);
    }

    public function test_atualizar_membro_sem_ser_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro);

        $response = $this->putJson(
            "/api/comunidades/{$comunidade->id}",
            ['nome' => 'Outro nome'],
            $this->authHeader($membro)
        );

        $response->assertStatus(403);
    }

    public function test_atualizar_comunidade_inexistente_retorna_404(): void
    {
        $organizador = $this->makeUser();

        $response = $this->putJson(
            '/api/comunidades/00000000-0000-0000-0000-000000000000',
            ['nome' => 'X'],
            $this->authHeader($organizador)
        );

        $response->assertStatus(404);
    }

    public function test_excluir_organizador_exclui_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DevTest']);

        $response = $this->deleteJson("/api/comunidades/{$comunidade->id}", [], $this->authHeader($organizador));

        $response->assertStatus(204);
        $this->assertFalse(Comunidade::where('id', $comunidade->id)->exists());
    }

    public function test_excluir_com_evento_futuro_retorna_400(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['data' => now()->addDays(5)->toDateString()]);

        $response = $this->deleteJson("/api/comunidades/{$comunidade->id}", [], $this->authHeader($organizador));

        $response->assertStatus(400);
        $this->assertTrue(Comunidade::where('id', $comunidade->id)->exists());
    }

    public function test_excluir_nao_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DevTest']);
        $outro = $this->makeUser();

        $response = $this->deleteJson("/api/comunidades/{$comunidade->id}", [], $this->authHeader($outro));

        $response->assertStatus(403);
    }

    private function payloadComunidade(): array
    {
        return [
            'nome' => 'DevCity',
            'descricao' => 'Comunidade local de desenvolvedores.',
            'cidade' => 'São Paulo',
            'contato' => 'dev@city.com',
        ];
    }
}
