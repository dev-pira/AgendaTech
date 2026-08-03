<?php

namespace Tests\Feature\Api;

use App\Models\Evento;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class EventoTest extends TestCase
{
    use CriaDados;

    public function test_listar_retorna_200_com_envelope_de_paginacao(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador);

        $response = $this->getJson('/api/eventos');

        $response->assertOk();
        $this->assertCount(1, $response->json('dados'));
        $this->assertEquals(1, $response->json('paginacao.total_itens'));
    }

    public function test_listar_filtra_por_comunidade(): void
    {
        $organizador = $this->makeUser();
        $comunidadeA = $this->makeComunidade($organizador, ['nome' => 'Comunidade A']);
        $comunidadeB = $this->makeComunidade($organizador, ['nome' => 'Comunidade B']);
        $this->makeEvento($comunidadeA, $organizador, ['titulo' => 'Evento da comunidade A']);
        $this->makeEvento($comunidadeB, $organizador, ['titulo' => 'Evento da comunidade B']);

        $response = $this->getJson("/api/eventos?comunidade_id={$comunidadeA->id}");

        $this->assertCount(1, $response->json('dados'));
        $this->assertEquals('Evento da comunidade A', $response->json('dados.0.titulo'));
    }

    public function test_listar_resposta_inclui_comunidade_e_organizador_aninhados(): void
    {
        $organizador = $this->makeUser(['username' => 'maria', 'first_name' => 'Maria', 'last_name' => 'Santos']);
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DevLimeira']);
        $this->makeEvento($comunidade, $organizador);

        $response = $this->getJson('/api/eventos');

        $this->assertEquals('DevLimeira', $response->json('dados.0.comunidade.nome'));
        $this->assertEquals('Maria Santos', $response->json('dados.0.organizador.nome'));
    }

    public function test_obter_retorna_200(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Meetup React Avançado']);

        $response = $this->getJson("/api/eventos/{$evento->id}");

        $response->assertOk();
        $this->assertEquals('Meetup React Avançado', $response->json('titulo'));
    }

    public function test_obter_id_inexistente_retorna_404(): void
    {
        $response = $this->getJson('/api/eventos/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404);
    }

    public function test_criar_sem_autenticacao_retorna_401(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->postJson('/api/eventos', $this->payloadEvento($comunidade->id));

        $response->assertStatus(401);
    }

    public function test_criar_membro_cria_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro);

        $response = $this->postJson('/api/eventos', $this->payloadEvento($comunidade->id), $this->authHeader($membro));

        $response->assertStatus(201);
        $this->assertTrue(Evento::where('titulo', 'Workshop Node.js')->exists());
    }

    public function test_criar_nao_membro_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $estranho = $this->makeUser();

        $response = $this->postJson('/api/eventos', $this->payloadEvento($comunidade->id), $this->authHeader($estranho));

        $response->assertStatus(403);
    }

    public function test_criar_data_passada_retorna_400(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $payload = $this->payloadEvento($comunidade->id, ['data' => now()->subDay()->toDateString()]);

        $response = $this->postJson('/api/eventos', $payload, $this->authHeader($organizador));

        $response->assertStatus(400);
    }

    public function test_criar_evento_duplicado_retorna_409(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $payload = $this->payloadEvento($comunidade->id);

        $this->postJson('/api/eventos', $payload, $this->authHeader($organizador));
        $response = $this->postJson('/api/eventos', $payload, $this->authHeader($organizador));

        $response->assertStatus(409);
    }

    public function test_criar_tipo_online_sem_url_retorna_400(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $payload = $this->payloadEvento($comunidade->id, ['tipo' => 'online', 'titulo' => 'Live Online']);

        $response = $this->postJson('/api/eventos', $payload, $this->authHeader($organizador));

        $response->assertStatus(400);
    }

    public function test_atualizar_organizador_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Tech Talk']);

        $response = $this->putJson(
            "/api/eventos/{$evento->id}",
            ['titulo' => 'Tech Talk - Edição Especial'],
            $this->authHeader($organizador)
        );

        $response->assertOk();
        $this->assertEquals('Tech Talk - Edição Especial', $evento->fresh()->titulo);
    }

    public function test_atualizar_membro_sem_ser_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Tech Talk']);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro);

        $response = $this->putJson(
            "/api/eventos/{$evento->id}",
            ['titulo' => 'Outro título'],
            $this->authHeader($membro)
        );

        $response->assertStatus(403);
    }

    public function test_atualizar_evento_passado_nao_pode_ser_editado(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $eventoPassado = $this->makeEvento($comunidade, $organizador, ['data' => now()->subDay()->toDateString()]);

        $response = $this->putJson(
            "/api/eventos/{$eventoPassado->id}",
            ['titulo' => 'Tentativa de edição'],
            $this->authHeader($organizador)
        );

        $response->assertStatus(400);
    }

    public function test_excluir_organizador_exclui_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Coding Dojo']);

        $response = $this->deleteJson("/api/eventos/{$evento->id}", [], $this->authHeader($organizador));

        $response->assertStatus(204);
        $this->assertFalse(Evento::where('id', $evento->id)->exists());
    }

    public function test_excluir_evento_passado_nao_pode_ser_excluido(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $eventoPassado = $this->makeEvento($comunidade, $organizador, ['data' => now()->subDay()->toDateString()]);

        $response = $this->deleteJson("/api/eventos/{$eventoPassado->id}", [], $this->authHeader($organizador));

        $response->assertStatus(400);
    }

    public function test_excluir_nao_organizador_recebe_403(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Coding Dojo']);
        $outro = $this->makeUser();

        $response = $this->deleteJson("/api/eventos/{$evento->id}", [], $this->authHeader($outro));

        $response->assertStatus(403);
    }

    private function payloadEvento(string $comunidadeId, array $overrides = []): array
    {
        return [
            'titulo' => 'Workshop Node.js',
            'descricao' => 'Hands-on de criação de APIs REST com Express.',
            'data' => now()->addDays(15)->toDateString(),
            'hora_inicio' => '14:00:00',
            'hora_fim' => '18:00:00',
            'local' => 'Espaço Maker - Av. Principal, 500',
            'tipo' => 'presencial',
            'comunidade_id' => $comunidadeId,
            ...$overrides,
        ];
    }
}
