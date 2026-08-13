<?php

namespace Tests\Feature\Api;

use Tests\Concerns\CriaDados;
use Tests\TestCase;

/**
 * Issue #83: rotas de escrita autenticadas (comunidades/eventos/membros)
 * não tinham nenhum rate limit - um usuário autenticado podia automatizar
 * centenas de requisições/segundo sem freio. throttle:60,1 adicionado nos
 * grupos auth:api de routes/api.php.
 */
class RateLimitTest extends TestCase
{
    use CriaDados;

    public function test_rota_de_escrita_autenticada_bloqueia_apos_60_requisicoes_no_minuto(): void
    {
        $user = $this->makeUser();
        $headers = $this->authHeader($user);

        // As primeiras 60 passam pela checagem de rate limit (podem falhar
        // por outro motivo, ex.: validação - o que importa aqui é o status
        // NÃO ser 429). A 61ª deve ser bloqueada pelo throttle:60,1.
        for ($i = 0; $i < 60; $i++) {
            $response = $this->postJson('/api/comunidades', [], $headers);
            $response->assertStatus(422); // corpo vazio - falha de validação, não de rate limit
        }

        $bloqueada = $this->postJson('/api/comunidades', [], $headers);
        $bloqueada->assertStatus(429);
    }

    public function test_rota_de_leitura_publica_nao_tem_rate_limit_apertado(): void
    {
        // Rotas GET públicas (index/show) ficaram de fora do throttle:60,1
        // de propósito - só as de escrita autenticadas foram limitadas.
        for ($i = 0; $i < 65; $i++) {
            $response = $this->getJson('/api/comunidades');
            $response->assertOk();
        }
    }
}
