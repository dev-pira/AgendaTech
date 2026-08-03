<?php

namespace Tests\Unit\Models;

use App\Models\Comunidade;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class ComunidadeTest extends TestCase
{
    use CriaDados;

    public function test_created(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);

        $this->assertTrue(Comunidade::where('nome', 'DEVPIRA')->exists());
    }

    public function test_criador_e_adicionado_como_organizador(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador);

        $vinculo = $comunidade->membrosVinculo()->where('usuario_id', $organizador->id)->firstOrFail();

        $this->assertEquals('organizador', $vinculo->papel);
    }

    public function test_nome_muito_curto_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);
        $organizador = $this->makeUser();

        $this->makeComunidade($organizador, ['nome' => 'ab']);
    }

    public function test_descricao_muito_curta_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);
        $organizador = $this->makeUser();

        $this->makeComunidade($organizador, ['descricao' => 'curta']);
    }

    public function test_contato_invalido_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);
        $organizador = $this->makeUser();

        $this->makeComunidade($organizador, ['contato' => 'nao-e-email-nem-url']);
    }

    public function test_logo_url_sem_extensao_de_imagem_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);
        $organizador = $this->makeUser();

        $this->makeComunidade($organizador, ['logo_url' => 'https://example.com/logo.pdf']);
    }

    public function test_logo_url_valida_e_aceita(): void
    {
        $organizador = $this->makeUser();
        $comunidade = $this->makeComunidade($organizador, ['logo_url' => 'https://example.com/logo.png']);

        $this->assertEquals('https://example.com/logo.png', $comunidade->logo_url);
    }

    public function test_nome_duplicado_case_insensitive_levanta_erro(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'DEVPIRA']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        $this->makeComunidade($organizador, ['nome' => 'devpira']);
    }

    public function test_ordering_por_nome(): void
    {
        $organizador = $this->makeUser();
        $this->makeComunidade($organizador, ['nome' => 'Zeta Community']);
        $this->makeComunidade($organizador, ['nome' => 'Alpha Community']);

        $nomes = Comunidade::orderBy('nome')->pluck('nome')->all();

        $ordenado = $nomes;
        sort($ordenado);
        $this->assertEquals($ordenado, $nomes);
    }
}
