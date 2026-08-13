<?php

namespace Tests\Feature;

use App\Models\Comunidade;
use App\Models\LogAuditoria;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Issue #101: log de auditoria (ator, ação CUD, tabela, id, data/hora),
 * escrito automaticamente via App\Support\Auditavel nos models rastreados
 * (Comunidade, Evento, ComunidadeMembro).
 */
class LogAuditoriaTest extends TestCase
{
    use CriaDados;

    public function test_criar_comunidade_via_api_registra_log_de_criacao(): void
    {
        $user = $this->makeUser();

        $response = $this->postJson('/api/comunidades', [
            'nome' => 'Comunidade Auditada',
            'descricao' => 'Descrição válida com mais de dez caracteres.',
            'cidade' => 'Limeira',
            'contato' => 'contato@example.com',
        ], $this->authHeader($user));

        $response->assertStatus(201);
        $comunidadeId = $response->json('id');

        $this->assertDatabaseHas('logs_auditoria', [
            'usuario_id' => $user->id,
            'acao' => 'criado',
            'tabela' => 'comunidades',
            'registro_id' => $comunidadeId,
        ]);
    }

    public function test_atualizar_comunidade_registra_log_de_atualizacao(): void
    {
        $user = $this->makeUser();
        $comunidade = $this->makeComunidade($user);

        $this->putJson("/api/comunidades/{$comunidade->id}", [
            'nome' => 'Nome Atualizado',
        ], $this->authHeader($user));

        $this->assertDatabaseHas('logs_auditoria', [
            'usuario_id' => $user->id,
            'acao' => 'atualizado',
            'tabela' => 'comunidades',
            'registro_id' => $comunidade->id,
        ]);
    }

    public function test_excluir_comunidade_registra_log_de_exclusao(): void
    {
        $user = $this->makeUser();
        $comunidade = $this->makeComunidade($user);

        $this->deleteJson("/api/comunidades/{$comunidade->id}", [], $this->authHeader($user));

        $this->assertDatabaseHas('logs_auditoria', [
            'usuario_id' => $user->id,
            'acao' => 'excluido',
            'tabela' => 'comunidades',
            'registro_id' => $comunidade->id,
        ]);
    }

    public function test_criar_evento_registra_log_de_criacao(): void
    {
        $user = $this->makeUser();
        $comunidade = $this->makeComunidade($user);

        $response = $this->postJson('/api/eventos', [
            'titulo' => 'Evento Auditado',
            'descricao' => 'Descrição válida com mais de vinte caracteres.',
            'data' => now()->addDays(10)->format('Y-m-d'),
            'hora_inicio' => '19:00',
            'local' => 'Online',
            'tipo' => 'online',
            'url_online' => 'https://example.com/evento',
            'comunidade_id' => $comunidade->id,
        ], $this->authHeader($user));

        $response->assertStatus(201);

        $this->assertDatabaseHas('logs_auditoria', [
            'usuario_id' => $user->id,
            'acao' => 'criado',
            'tabela' => 'eventos',
            'registro_id' => $response->json('id'),
        ]);
    }

    public function test_adicionar_membro_registra_log_de_criacao(): void
    {
        $organizador = $this->makeUser();
        $novoMembro = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $response = $this->postJson(
            "/api/comunidades/{$comunidade->id}/membros",
            ['email' => $novoMembro->email, 'papel' => 'membro'],
            $this->authHeader($organizador),
        );

        $response->assertStatus(201);

        $this->assertDatabaseHas('logs_auditoria', [
            'usuario_id' => $organizador->id,
            'acao' => 'criado',
            'tabela' => 'comunidade_membros',
        ]);
    }

    public function test_acao_sem_usuario_autenticado_registra_log_com_ator_nulo(): void
    {
        // Criação direta via model (ex.: seeder, comando artisan) - sem
        // request autenticado, o log ainda precisa ser gravado, so com
        // usuario_id nulo.
        $comunidade = Comunidade::factory()->create();

        $log = LogAuditoria::where('tabela', 'comunidades')
            ->where('registro_id', $comunidade->id)
            ->where('acao', 'criado')
            ->first();

        $this->assertNotNull($log);
        $this->assertNull($log->usuario_id);
    }
}
