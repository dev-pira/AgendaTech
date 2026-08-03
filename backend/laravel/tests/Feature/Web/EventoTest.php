<?php

namespace Tests\Feature\Web;

use App\Models\Evento;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class EventoTest extends TestCase
{
    use CriaDados;

    public function test_lista_retorna_200_e_lista_eventos(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['titulo' => 'Meetup React Avançado']);

        $response = $this->get('/eventos');

        $response->assertOk();
        $response->assertSee('Meetup React Avançado');
    }

    public function test_lista_filtra_por_comunidade(): void
    {
        $organizador = $this->makeUser();
        $comunidadeA = $this->makeComunidade($organizador, ['nome' => 'Comunidade A']);
        $comunidadeB = $this->makeComunidade($organizador, ['nome' => 'Comunidade B']);
        $this->makeEvento($comunidadeA, $organizador, ['titulo' => 'Evento A']);
        $this->makeEvento($comunidadeB, $organizador, ['titulo' => 'Evento B']);

        $response = $this->get("/eventos?comunidade={$comunidadeA->id}");

        $response->assertSee('Evento A');
        $response->assertDontSee('Evento B');
    }

    public function test_lista_sem_resultados_mostra_mensagem_vazia(): void
    {
        $this->get('/eventos')->assertSee('Nenhum evento encontrado');
    }

    public function test_detalhe_retorna_200_com_dados(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Workshop Node.js']);

        $response = $this->get("/eventos/{$evento->id}");

        $response->assertOk();
        $response->assertSee('Workshop Node.js');
    }

    public function test_detalhe_id_inexistente_retorna_404(): void
    {
        $this->get('/eventos/00000000-0000-0000-0000-000000000000')->assertNotFound();
    }

    public function test_botoes_de_gestao_ocultos_para_evento_passado(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $eventoPassado = $this->makeEvento($comunidade, $organizador, ['data' => now()->subDay()->toDateString()]);

        $response = $this->actingAs($organizador)->get("/eventos/{$eventoPassado->id}");

        $response->assertDontSee("/eventos/{$eventoPassado->id}/editar", false);
    }

    private function payloadEvento(string $comunidadeId, array $overrides = []): array
    {
        return [
            'titulo' => 'Workshop Node.js',
            'descricao' => 'Hands-on de criação de APIs REST com Express.',
            'data' => now()->addDays(15)->toDateString(),
            'hora_inicio' => '14:00',
            'hora_fim' => '18:00',
            'local' => 'Espaço Maker - Av. Principal, 500',
            'tipo' => 'presencial',
            'url_online' => '',
            'comunidade_id' => $comunidadeId,
            ...$overrides,
        ];
    }

    public function test_criar_anonimo_e_redirecionado_para_login(): void
    {
        $this->get('/eventos/novo')->assertRedirect('/login');
    }

    public function test_criar_usuario_sem_comunidade_e_redirecionado(): void
    {
        $estranho = $this->makeUser();

        $response = $this->actingAs($estranho)->get('/eventos/novo');

        $response->assertRedirect('/comunidades');
    }

    public function test_criar_membro_cria_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro);

        $response = $this->actingAs($membro)->post('/eventos/novo', $this->payloadEvento($comunidade->id));

        $evento = Evento::where('titulo', 'Workshop Node.js')->firstOrFail();
        $response->assertRedirect("/eventos/{$evento->id}");
    }

    public function test_criar_data_passada_reexibe_formulario_com_erro(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $payload = $this->payloadEvento($comunidade->id, ['data' => now()->subDay()->toDateString()]);

        $response = $this->actingAs($organizador)->post('/eventos/novo', $payload);

        $response->assertSessionHasErrors();
    }

    public function test_atualizar_organizador_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Tech Talk']);

        $response = $this->actingAs($organizador)->put("/eventos/{$evento->id}/editar", [
            'titulo' => 'Tech Talk - Edição Especial',
            'descricao' => $evento->descricao,
            'data' => $evento->data->toDateString(),
            'hora_inicio' => $evento->hora_inicio,
            'hora_fim' => '',
            'local' => $evento->local,
            'tipo' => $evento->tipo,
            'url_online' => '',
        ]);

        $response->assertRedirect("/eventos/{$evento->id}");
        $this->assertEquals('Tech Talk - Edição Especial', $evento->fresh()->titulo);
    }

    public function test_atualizar_membro_sem_ser_organizador_e_redirecionado(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Tech Talk']);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro);

        $response = $this->actingAs($membro)->get("/eventos/{$evento->id}/editar");

        $response->assertRedirect("/eventos/{$evento->id}");
    }

    public function test_atualizar_evento_passado_nao_pode_ser_editado(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $eventoPassado = $this->makeEvento($comunidade, $organizador, ['data' => now()->subDay()->toDateString()]);

        $response = $this->actingAs($organizador)->get("/eventos/{$eventoPassado->id}/editar");

        $response->assertRedirect("/eventos/{$eventoPassado->id}");
    }

    public function test_excluir_get_retorna_pagina_de_confirmacao(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Coding Dojo']);

        $response = $this->actingAs($organizador)->get("/eventos/{$evento->id}/excluir");

        $response->assertOk();
        $response->assertSee('Confirmar exclusão');
    }

    public function test_excluir_post_exclui_e_redireciona(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Coding Dojo']);

        $response = $this->actingAs($organizador)->delete("/eventos/{$evento->id}/excluir");

        $response->assertRedirect('/eventos');
        $this->assertFalse(Evento::where('id', $evento->id)->exists());
    }

    public function test_excluir_evento_passado_nao_pode_ser_excluido(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $eventoPassado = $this->makeEvento($comunidade, $organizador, ['data' => now()->subDay()->toDateString()]);

        $response = $this->actingAs($organizador)->delete("/eventos/{$eventoPassado->id}/excluir");

        $response->assertRedirect("/eventos/{$eventoPassado->id}");
        $this->assertTrue(Evento::where('id', $eventoPassado->id)->exists());
    }

    public function test_excluir_nao_organizador_e_redirecionado(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $evento = $this->makeEvento($comunidade, $organizador, ['titulo' => 'Coding Dojo']);
        $outro = $this->makeUser();

        $response = $this->actingAs($outro)->delete("/eventos/{$evento->id}/excluir");

        $response->assertRedirect("/eventos/{$evento->id}");
        $this->assertTrue(Evento::where('id', $evento->id)->exists());
    }
}
