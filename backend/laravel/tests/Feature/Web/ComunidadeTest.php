<?php

namespace Tests\Feature\Web;

use App\Models\Comunidade;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class ComunidadeTest extends TestCase
{
    use CriaDados;

    public function test_lista_retorna_200_e_lista_comunidades(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira']);

        $response = $this->get('/comunidades');

        $response->assertOk();
        $response->assertSee('DEVPIRA');
        $response->assertSee('DevLimeira');
    }

    public function test_lista_filtra_por_busca(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira']);

        $response = $this->get('/comunidades?busca=DEVPIRA');

        $response->assertSee('DEVPIRA');
        $response->assertDontSee('DevLimeira');
    }

    public function test_lista_filtra_por_cidade(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'PiraTech', 'cidade' => 'Piracicaba']);
        $this->makeComunidade($organizador, ['nome' => 'DevLimeira', 'cidade' => 'Limeira']);

        $response = $this->get('/comunidades?cidade=Limeira');

        $response->assertDontSee('PiraTech');
        $response->assertSee('DevLimeira');
    }

    public function test_lista_sem_resultados_mostra_mensagem_vazia(): void
    {
        $this->get('/comunidades')->assertSee('Nenhuma comunidade encontrada');
    }

    public function test_detalhe_retorna_200_com_dados(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);

        $response = $this->get("/comunidades/{$comunidade->id}");

        $response->assertOk();
        $response->assertSee('DEVPIRA');
    }

    public function test_detalhe_id_inexistente_retorna_404(): void
    {
        $this->get('/comunidades/00000000-0000-0000-0000-000000000000')->assertNotFound();
    }

    public function test_botoes_de_gestao_ocultos_para_visitante(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->get("/comunidades/{$comunidade->id}");

        $response->assertDontSee("/comunidades/{$comunidade->id}/editar", false);
    }

    public function test_botoes_de_gestao_visiveis_para_organizador(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->actingAs($organizador)->get("/comunidades/{$comunidade->id}");

        $response->assertSee("/comunidades/{$comunidade->id}/editar", false);
    }

    private function payloadComunidade(): array
    {
        return [
            'nome' => 'DevCity',
            'descricao' => 'Comunidade local de desenvolvedores.',
            'cidade' => 'São Paulo',
            'contato' => 'dev@city.com',
            'logo_url' => '',
        ];
    }

    public function test_criar_anonimo_e_redirecionado_para_login(): void
    {
        $this->get('/comunidades/nova')->assertRedirect('/login');
    }

    public function test_criar_get_autenticado_retorna_200(): void
    {
        $organizador = $this->makeUser();

        $this->actingAs($organizador)->get('/comunidades/nova')->assertOk();
    }

    public function test_criar_post_valido_cria_e_redireciona_para_detalhe(): void
    {
        $organizador = $this->makeUser();

        $response = $this->actingAs($organizador)->post('/comunidades/nova', $this->payloadComunidade());

        $comunidade = Comunidade::where('nome', 'DevCity')->firstOrFail();
        $response->assertRedirect("/comunidades/{$comunidade->id}");
    }

    public function test_criador_vira_organizador_automaticamente(): void
    {
        $organizador = $this->makeUser();

        $this->actingAs($organizador)->post('/comunidades/nova', $this->payloadComunidade());

        $comunidade = Comunidade::where('nome', 'DevCity')->firstOrFail();
        $vinculo = $comunidade->membrosVinculo()->where('usuario_id', $organizador->id)->firstOrFail();
        $this->assertEquals('organizador', $vinculo->papel);
    }

    public function test_criar_nome_duplicado_reexibe_formulario_com_erro(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DevCity']);

        $response = $this->actingAs($organizador)->post('/comunidades/nova', $this->payloadComunidade());

        $response->assertSessionHasErrors('nome');
    }

    public function test_atualizar_organizador_com_sucesso(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);

        $response = $this->actingAs($organizador)->put("/comunidades/{$comunidade->id}/editar", [
            'nome' => 'DEVPIRA - Piracicaba',
            'descricao' => $comunidade->descricao,
            'cidade' => $comunidade->cidade,
            'contato' => $comunidade->contato,
            'logo_url' => '',
        ]);

        $response->assertRedirect("/comunidades/{$comunidade->id}");
        $this->assertEquals('DEVPIRA - Piracicaba', $comunidade->fresh()->nome);
    }

    public function test_atualizar_membro_sem_ser_organizador_e_redirecionado_com_erro(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $membro = $this->makeUser();
        $this->addMembro($comunidade, $membro);

        $response = $this->actingAs($membro)->get("/comunidades/{$comunidade->id}/editar");

        $response->assertRedirect("/comunidades/{$comunidade->id}");
    }

    public function test_excluir_get_retorna_pagina_de_confirmacao(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DevTest']);

        $response = $this->actingAs($organizador)->get("/comunidades/{$comunidade->id}/excluir");

        $response->assertOk();
        $response->assertSee('Confirmar exclusão');
    }

    public function test_excluir_post_exclui_e_redireciona(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DevTest']);

        $response = $this->actingAs($organizador)->delete("/comunidades/{$comunidade->id}/excluir");

        $response->assertRedirect('/comunidades');
        $this->assertFalse(Comunidade::where('id', $comunidade->id)->exists());
    }

    public function test_excluir_com_evento_futuro_nao_exclui(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);
        $this->makeEvento($comunidade, $organizador, ['data' => now()->addDays(5)->toDateString()]);

        $response = $this->actingAs($organizador)->delete("/comunidades/{$comunidade->id}/excluir");

        $response->assertRedirect("/comunidades/{$comunidade->id}");
        $this->assertTrue(Comunidade::where('id', $comunidade->id)->exists());
    }

    public function test_excluir_nao_organizador_e_redirecionado(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['nome' => 'DevTest']);
        $outro = $this->makeUser();

        $response = $this->actingAs($outro)->delete("/comunidades/{$comunidade->id}/excluir");

        $response->assertRedirect("/comunidades/{$comunidade->id}");
        $this->assertTrue(Comunidade::where('id', $comunidade->id)->exists());
    }
}
