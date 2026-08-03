<?php

namespace Tests\Unit\Models;

use App\Models\Evento;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\CriaDados;
use Tests\TestCase;

class EventoTest extends TestCase
{
    use CriaDados;

    private $organizador;

    private $comunidade;

    protected function setUp(): void
    {
        parent::setUp();
        $this->organizador = $this->makeUser();
        $this->comunidade = $this->makeComunidade($this->organizador);
    }

    public function test_created(): void
    {
        $this->makeEvento($this->comunidade, $this->organizador, ['titulo' => 'Meetup React']);

        $this->assertTrue(Evento::where('titulo', 'Meetup React')->exists());
    }

    public function test_titulo_muito_curto_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);

        $this->makeEvento($this->comunidade, $this->organizador, ['titulo' => 'Oi']);
    }

    public function test_descricao_muito_curta_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);

        $this->makeEvento($this->comunidade, $this->organizador, ['descricao' => 'curta demais']);
    }

    public function test_hora_fim_antes_de_hora_inicio_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);

        $this->makeEvento($this->comunidade, $this->organizador, [
            'hora_inicio' => '19:00:00',
            'hora_fim' => '18:00:00',
        ]);
    }

    public function test_hora_fim_apos_hora_inicio_e_aceito(): void
    {
        $evento = $this->makeEvento($this->comunidade, $this->organizador, [
            'hora_inicio' => '19:00:00',
            'hora_fim' => '21:00:00',
        ]);

        $this->assertEquals('21:00:00', $evento->hora_fim);
    }

    public function test_tipo_online_sem_url_levanta_validation_error(): void
    {
        $this->expectException(ValidationException::class);

        $this->makeEvento($this->comunidade, $this->organizador, ['tipo' => Evento::ONLINE, 'url_online' => '']);
    }

    public function test_tipo_online_com_url_e_aceito(): void
    {
        $evento = $this->makeEvento($this->comunidade, $this->organizador, [
            'tipo' => Evento::ONLINE,
            'url_online' => 'https://meet.example.com/sala',
        ]);

        $this->assertEquals('online', $evento->tipo);
    }

    public function test_evento_duplicado_mesma_comunidade_titulo_data_levanta_erro(): void
    {
        $data = now()->addDays(10)->toDateString();
        $this->makeEvento($this->comunidade, $this->organizador, ['titulo' => 'Workshop Node.js', 'data' => $data]);

        $this->expectException(QueryException::class);
        $this->makeEvento($this->comunidade, $this->organizador, ['titulo' => 'Workshop Node.js', 'data' => $data]);
    }

    public function test_ordering_por_data_e_hora(): void
    {
        $this->makeEvento($this->comunidade, $this->organizador, [
            'data' => now()->addDays(20)->toDateString(), 'hora_inicio' => '10:00:00',
        ]);
        $this->makeEvento($this->comunidade, $this->organizador, [
            'data' => now()->addDays(5)->toDateString(), 'hora_inicio' => '10:00:00',
        ]);

        $datas = Evento::orderBy('data')->orderBy('hora_inicio')->pluck('data')->map->toDateString()->all();

        $ordenado = $datas;
        sort($ordenado);
        $this->assertEquals($ordenado, $datas);
    }
}
